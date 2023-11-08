// common.js
import { get_show_data } from "../common.js";

export const edit_show = {
    props: ['id'],
    template: `
      <div id="edit_show">
        <h2>Edit Show</h2>
        <form @submit.prevent="submitForm">
          <div class="form-group">
            <label for="name">Name:</label>
            <input type="text" class="form-control" id="name" v-model="show.name" required>
          </div>
          <div class="form-group">
            <label for="start_time">Start Time:</label>
            <input type="text" class="form-control" id="start_time" v-model="show.start_time" required>
          </div>
          <div class="form-group">
            <label for="end_time">End Time:</label>
            <input type="text" class="form-control" id="end_time" v-model="show.end_time" required>
          </div>
          <div class="form-group">
            <label for="price">Price:</label>
            <input type="number" class="form-control" id="price" v-model="show.price" required>
          </div>
          <div class="form-group">
            <label for="tags">Tags:</label>
            <input type="text" class="form-control" id="tags" v-model="show.tags" required>
          </div>
          <button type="submit" :disabled="isLoading" class="btn btn-primary">Save Changes</button>
        </form>
      </div>
    `,
    data: function () {
      return {
        title: 'Edit Show',
        show: null,
        isLoading : false,
        errors: [],
      };
    },
  
    methods: {

      submitForm: async function () {
        try {
          this.isLoading = true;
          console.log(this.show.start_time)
          this.show.start_time = this.show.start_time.replace(" ", "T").substring(0, 16);
          this.show.end_time = this.show.end_time.replace(" ", "T").substring(0, 16);
          console.log(this.show)
          let token = sessionStorage.getItem('token');
          // Perform the API put request to edit the show
          const response = await fetch(`/api/show/${this.show.id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(this.show),
          });
  
          if (!response.ok) {
            // Handle errors if needed
            this.isLoading = false;
            const data = await response.json();
            throw new Error(`Error ${response.status}: ${data.description}`);
          }
  
          // Redirect to admin_dashboard after successful put
          this.isLoading = false;
          alert("Show edited successfully!");
          this.$router.push({ name: 'admin_home' });
        } catch (error) {
          this.isLoading = false;
          alert(error.message);
          this.$router.push({ name: 'admin_home' });
        }
      },
    },
  
    mounted: async function () {
      try {
        let sdata = await get_show_data(this.$route.params.id);
        console.log(sdata);
        this.show = sdata;
      } catch (error) {
        alert(error.message);
        this.$router.push({ name: 'admin_home' });
      }
    },
  };
  