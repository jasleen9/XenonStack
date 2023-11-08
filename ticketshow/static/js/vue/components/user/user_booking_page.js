import { get_show_data } from "../common.js";
import { get_theatre_data } from "../common.js";


//---------------------------------------------------BOOKINGS------------------------------------------------------------------------------

Vue.component("dbooking", {
  props: ["dataObj", "dex" , "showdataobj"],
  template: `
    <div class="container" style="padding-top: 10px;">
          <div class="row bg-light border-dark border-4">
            <div class="col align-items-center">
              <div v-if="showdataobj">
                <div class="row">
                  <h5>{{ showdataobj.name }}</h5>
                </div>
                <div class="row">
                  <p>Timing: {{ formatDateTime(showdataobj.start_time) }} : {{ formatTime(showdataobj.end_time) }}</p>
                </div>
              </div>
              <div v-else>
                <p>Loading show data...</p>
              </div>
            </div>
            <div class="col d-flex justify-content-end align-items-center">
                <div class="container mt-2">
                    <p v-if="dataObj.user_rating > 0" class="mt-2 mr-2 font-weight-bold"> YOUR RATING : {{dataObj.user_rating }}</p>
                    <p v-else class="mt-2 mr-2 font-weight-bold"> You have not rated the show</p>
                </div>
          
                <div>
                <label for="rating">Rating:</label>
                <select id="rating" v-model.number="rating">
                  <option>5</option>
                  <option>4</option>
                  <option>3</option>
                  <option>2</option>
                  <option>1</option>
                </select>
                </div>
                <button type="submit" @click="rateShow(dex)" :disabled="isLoading" class="btn btn-warning">Rate</button>
                </div>
            </div>
          </div>      
    </div>
`,

  data: function () {
    return {
      isLoading:false,
      user: sessionStorage.getItem("username"),
      rating:0,
      booking_id: this.dataObj.id
    };
  },
  

  methods: {
    formatDateTime(dateTimeString) {
      const dateTime = new Date(dateTimeString);
      const dateOptions = { year: "numeric", month: "long", day: "numeric" };
      const timeOptions = { hour: "numeric", minute: "numeric", hour12: true };
      const formattedDate = dateTime.toLocaleDateString(undefined, dateOptions);
      const formattedTime = dateTime.toLocaleTimeString(undefined, timeOptions);
      return `${formattedDate} - ${formattedTime}`;
    },

    formatTime(dateTimeString) {
      const dateTime = new Date(dateTimeString);
      const timeOptions = { hour: "numeric", minute: "numeric", hour12: true };
      const formattedTime = dateTime.toLocaleTimeString(undefined, timeOptions);
      return `${formattedTime}`;
    },

    rateShow: async function (dex) {
      this.isLoading = true;
      let token = sessionStorage.getItem("token");
      await fetch(`/api/add_rating/${this.booking_id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "user_rating": this.rating, 
      })
      })
        .then((response) =>
          response
            .json()
            .then((jdata) => ({ response: response, data: jdata }))
        )
        .then(({ response, data }) => {
          if (!response.ok) {
            this.isLoading = false;
            console.log('response not ok')
            console.log(data)
            throw new Error(`Error ${response.status}: ${data.description}`);
          } else {
            this.isLoading = false;
            this.$emit('rating-updated', this.rating , dex);
            alert("You have rated the show!");
          }
        })
        .catch((error) => {
          if (error.message.includes("Token has expired")) {
            this.isLoading = false;
            alert("Re-login required, token has expired");
            this.$router.push("/relogin");
          }
          alert(error.message, "Error");
        });
    }
  },


});


//---------------------------------------------------ALL USER BOOKINGS------------------------------------------------------------------------------

export const user_bookings = {
  template: `
    <div id="user_bookings">
      <h3>Hi, {{ user }} !</h3>
      <h5>Your Bookings!</h5>
      <div style="display: flex; flex-wrap: wrap; justify-content: center;">
        <div class="row">
          <dbooking
            v-for="(booking, index) in booking_data" :dataObj="booking" :showdataobj="show_data[index]" :dex="index" :key="booking.id" @rating-updated = "handleRatingUpdated">
          </dbooking>
        </div>
      </div>
    </div>
  `,
  data: function () {
    return {
      booking_data: null,
      show_data: [], // Initialize as an empty array
      user: sessionStorage.getItem("username"),
    };
  },

  methods: {
    fetchShowData: async function (s_id) {
      try {
        let sdata = await get_show_data(s_id);
        return sdata; // Return the fetched show data
      } catch (error) {
        console.error("Error fetching show data:", error);
        throw error; // Rethrow the error to handle it in the template
      }
    },
    handleRatingUpdated(rating, dex) {
      // Update the user_rating of the corresponding booking
      this.booking_data[dex].user_rating = rating;
    }
  },

  mounted: async function () {
    let token = sessionStorage.getItem("token");
    await fetch("/api/userbookings", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) =>
        response.json().then((jdata) => ({ response: response, data: jdata }))
      )
      .then(({ response, data }) => {
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${data.description}`);
        }
        this.booking_data = data;

        // Fetch show data for each booking and store in show_data array
        const fetchPromises = data.map((booking) =>
          this.fetchShowData(booking.show_id)
        );

        Promise.all(fetchPromises)
          .then((showDataArray) => {
            this.show_data = showDataArray;
          })
          .catch((error) => {
            console.error("Error fetching show data:", error);
          });
      })
      .catch((error) => {
        if (error.message.includes("Token has expired")) {
          window.alert("Re-login required, token has expired");
          this.$router.push("/relogin");
        }
        window.alert("Error: " + error.message);
      });

  },

};
