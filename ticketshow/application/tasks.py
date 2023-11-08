from application.workers import celery
from flask import current_app as app
from application.database import db
from application.models import Theatre , Show , Booking , User
import application.data_access as da 

import requests
from datetime import datetime,timedelta


from flask import render_template
from weasyprint import HTML
import os
import uuid

from bs4 import BeautifulSoup
import csv
import io

from celery.schedules import crontab


from email.mime.base import MIMEBase
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.encoders import encode_base64
import tempfile


SMTP_SERVER_HOST = "localhost"
SMTP_SERVER_PORT = 1025

SMTP_SENDER_USERNAME = "ticketshow@test.com"
SMTP_SENDER_PASSWORD = ""

#==================================EXPORT MONTHLY=============================================================

def send_mail(to, subject, message, attachments=None):
    try:
        msg = MIMEMultipart()
        msg["From"] = SMTP_SENDER_USERNAME
        msg["To"] = to
        msg["Subject"] = subject
        msg.attach(MIMEText(message, "html"))

        if attachments:
            with open(attachments, "rb") as file:
                part = MIMEBase("application", "octet-stream")
                part.set_payload(file.read())
            encode_base64(part)
            part.add_header(
                "Content-Disposition",
                f"attachment; filename= {attachments}",
            )
            msg.attach(part)

        s = smtplib.SMTP(host=SMTP_SERVER_HOST, port=SMTP_SERVER_PORT)
        s.login(SMTP_SENDER_USERNAME, SMTP_SENDER_PASSWORD)

        s.send_message(msg)
        s.quit()
        return True
    except Exception as e:
        print(e)
        return False
    

def get_booking_data_for_user(user_id):
    booking_data = []
    user = User.query.get(user_id)
    user_bookings = user.user_bookings
    
    for booking in user_bookings:
        show = Show.query.get(booking.show_id)
        theatre_name = Theatre.query.with_entities(Theatre.name).filter_by(id=show.theatre_id).scalar()
        
        booking_info = {
            'booking_time': booking.booking_time,
            'seats':booking.seats,
            'user_rating':booking.user_rating,
            'show_name': show.name,
            'show_start_time': show.start_time,
            'theatre_name': theatre_name,
            'ticket_price':show.price,
            'amount': (booking.seats)*(show.price)
        }
        
        booking_data.append(booking_info)
    
    return booking_data

@celery.task()
def generate_pdf_send_email():
    users = User.query.all()  
    for user in users:
        booking_data = get_booking_data_for_user(user.id)
        
        # Render the HTML template with booking_data
        rendered_html = render_template('monthly_report.html', booking_data=booking_data , user = user)
    
        # Generate PDF using WeasyPrint
        pdf_file = tempfile.NamedTemporaryFile(delete=True, suffix='.pdf')
        
        pdf_data = HTML(string=rendered_html).write_pdf()
            
        # Write PDF data to the temporary file
        with open(pdf_file.name, 'wb') as f:
            f.write(pdf_data)
    
        # Send the PDF as an email attachment
        subject = "Your Monthly Booking Report"
        message = "Here is your monthly booking report"
        attachments = pdf_file.name
    
        send_mail(user.email, subject, message, attachments)

    
    
#===========DAILY REMINDER===========================================================================================


WEBHOOK_URL = "https://chat.googleapis.com/v1/spaces/AAAAioJZjyA/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=aRdjGBSSmba8_MbBXaWl10lR0aSYFuUcQ733YyyBhEA"         
@celery.task
def send_google_chat_message():
    # Logic to fetch users who haven't booked in the past 24 hours
    twenty_four_hours_ago = datetime.now() - timedelta(hours=24)
    
    all_users = db.session.query(User).all()
    users_without_bookings = []
    # Query users who haven't booked in the past 24 hours
    for user in all_users:
        bookings_within_24_hours = [booking for booking in user.user_bookings if booking.booking_time >= twenty_four_hours_ago]
        if len(bookings_within_24_hours) == 0:
            users_without_bookings.append(user)
            

    for user in users_without_bookings:
        message = f"Hi! {user.username} , You haven't booked any show in the past 24 hours :("
        payload = {
            "text": message,
        }
        
        response = requests.post(WEBHOOK_URL, json=payload)
        
        if response.status_code == 200:
            print("Reminder sent successfully.")
        else:
            print("Failed to send reminder.")

#====================================Schedule==========================

@celery.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    sender.add_periodic_task(
        crontab(day_of_month=1, hour=18),  
        send_google_chat_message.s(),
        name='daily reminder'
    )
    
    sender.add_periodic_task(
        crontab(hour=15, minute=15),  
        generate_pdf_send_email.s(),
        name='monthly report'
    )


#=====================SINGLE EXPORT=============================================================================


@celery.task()
def export_theatre_pdf(theatre_id):
    try:
        theatre = Theatre.query.get(theatre_id)
        if not theatre:
            return "Theatre not found"

        rendered_html = render_template('export_theatre.html', theatre=theatre, shows=theatre.shows)
        pdf = HTML(string=rendered_html).write_pdf()
        
        os.makedirs('temp', exist_ok=True)
        pdf_filename = f'temp/theatre_{theatre_id}.pdf'

        with open(pdf_filename , 'wb') as pdf_file:
            pdf_file.write(pdf)

        print( f"PDF exported for theatre {theatre_id}")
    except Exception as e:
        return str(e)

@celery.task()
def export_theatre_csv(theatre_id):
    try:
        theatre = Theatre.query.get(theatre_id)
        if not theatre:
            return "Theatre not found"

        rendered_html = render_template('export_theatre.html', theatre=theatre, shows=theatre.shows)
        csv_data = html_to_csv(rendered_html, theatre)
        
        os.makedirs('temp', exist_ok=True)

        # Save the CSV file
        csv_filename = f'temp/theatre_{theatre_id}.csv'
        with open(csv_filename, 'w') as csv_file:
            csv_file.write(csv_data)

        return f"CSV exported for theatre {theatre_id}"
    except Exception as e:
        return str(e)

def html_to_csv(html_string, theatre):
    soup = BeautifulSoup(html_string, 'html.parser')

    # Extract theatre details
    theatre_name = theatre.name
    theatre_address = theatre.address
    theatre_city = theatre.city
    theatre_capacity = theatre.capacity

    # Extract show details
    show_data = []
    table = soup.find('table')
    if table:
        rows = table.find_all('tr')[1:]  # Skip the header row
        for row in rows:
            cells = row.find_all('td')
            show_index = cells[0].get_text(strip=True)
            show_name = cells[1].get_text(strip=True)
            start_time = cells[2].get_text(strip=True)
            end_time = cells[3].get_text(strip=True)
            price = cells[4].get_text(strip=True)
            tags = cells[5].get_text(strip=True)
            show_data.append([show_index, show_name, start_time, end_time, price, tags])

    # Create CSV data
    csv_output = io.StringIO()
    csv_writer = csv.writer(csv_output)
    
    # Write theatre details
    csv_writer.writerow(["theatre_name", "theatre_address", "theatre_city", "theatre_capacity"])
    csv_writer.writerow([theatre_name, theatre_address, theatre_city, theatre_capacity])
    
    # Write a blank line
    csv_writer.writerow([])
    
    # Write show details header
    csv_writer.writerow(["Index","Show_name", "start_time", "end_time", "price", "tags"])
    
    # Write show data
    csv_writer.writerows(show_data)
    
    return csv_output.getvalue()




