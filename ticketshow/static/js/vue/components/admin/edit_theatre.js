import { get_theatre_data } from "../common.js"

export const edit_theatre = {
    props : ['id'] ,
    template: `
    <div id="edit_theatre">
    <h2>Edit Theatre</h2>
    <form @submit.prevent="submitForm">
      <div class="form-group">
        <label for="name">Name:</label>
        <input type="text" class="form-control" id="name" v-model="theatre.name" required>
      </div>
      <div class="form-group">
        <label for="address">Address:</label>
        <input type="text" class="form-control" id="address" v-model="theatre.address" required>
      </div>
      <div class="form-group">
        <label for="city">City:</label>
        <input type="text" class="form-control" id="city" v-model="theatre.city" required>
      </div>
      <div class="form-group">
        <label for="capacity">Capacity:</label>
        <input type="number" class="form-control" id="capacity" v-model="theatre.capacity" required>
      </div>
      <button type="submit" :disabled="isLoading" class="btn btn-primary">Save Changes</button>
    </form>
  </div>
    `,
    data: function () {
        return {
            title : "Edit Theatre",
            theatre: {
                name: '',
                address:'' ,
                city: '',
                capacity: 0,
              },
            isLoading : false ,
            errors: []
        }
    },
    
  
      methods: {

        submitForm: async function () {
          try {
            this.isLoading = true;
            let token = sessionStorage.getItem('token');
            // Perform the API put request to edit the theatre
            const response = await fetch(`/api/theatre/${this.theatre.id}`, {
              method: 'PUT',
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(this.theatre),
            });
    
            if (!response.ok) {
              // Handle errors if needed
              this.isLoading = false;
              const data = await response.json();
              throw new Error(`Error ${response.status}: ${data.description}`);
            }
            // Redirect to admin_dashboard after successful put
            this.isLoading = false;
            this.$router.push({ name: 'admin_home' });
          } catch (error) {
            this.isLoading = false;
            alert(error.message);
            this.$router.push({ name: 'admin_home' });
          }
        },
      },
    
      mounted: async function () {
        let tdata = get_theatre_data(this.$route.params.id);
        console.log(tdata);
        tdata.then(data => {
          this.theatre = data;
        }).catch(error => {
          alert(error.message);
          this.$router.push({ name: 'admin_home' });
        });
      }
}