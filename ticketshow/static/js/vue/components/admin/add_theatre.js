export const add_theatre = {
  template: `
  <div id="add_theatre">
      <h3>ADD NEW THEATRE</h3>
      <form  @submit.prevent="submitForm">
          <div class="mb-3">
            <label for="name" class="form-label">Name</label>
            <input type="text" class="form-control" v-model="theatreData.name" id="name" aria-describedby="nameHelp" required>
          </div>
          <div class="mb-3">
            <label for="address" class="form-label">Address</label>
            <input type="text" class="form-control" v-model="theatreData.address" id="address" required>
          </div>
          <div class="mb-3">
            <label for="city" class="form-label">City</label>
            <input type="text" class="form-control" v-model="theatreData.city" id="city" required>
          </div>
          <div class="mb-3">
            <label for="capacity" class="form-label">Capacity</label>
            <input type="number" class="form-control" v-model="theatreData.capacity" id="capacity" required>
          </div>
          <button type="submit" :disabled="isLoading" class="btn btn-primary"> Submit </button>
      </form>
  </div>
  `,
  data: function () {
      return {
          title : "Add Theatre",
          theatreData: {
              name: '',
              address: '',
              city: '',
              capacity:0
            },
            isLoading : false,
            errors: []
      }
  },
    methods: {

      submitForm: async function () {
        this.isLoading = true;
        let token = sessionStorage.getItem("token");
        await fetch(`/api/theatre`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            "name": this.theatreData.name, 
            "address": this.theatreData.address, 
            "city": this.theatreData.city,
            "capacity": this.theatreData.capacity
        })
        })
          .then((response) =>
            response
              .json()
              .then((jdata) => ({ response: response, data: jdata }))
          )
          .then(({ response, data }) => {
            if (!response.ok) {
              console.log('response not ok')
              this.isLoading = false;
              throw new Error(`Error ${response.status}: ${data.description}`);
            } else {
                this.isLoading = false;
                this.$router.push({ name: 'admin_home' });
                alert("Theatre Created!");
            }
          })
          .catch((error) => {
            if (error.message.includes("Token has expired")) {
              this.isLoading = false;
              alert("Re-login required, token has expired");
              this.$router.push("/relogin");
            }
            alert(error.message, "Error");
            //console.log(error)
          });
      }
    },
  };
  