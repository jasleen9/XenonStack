export const add_show = {
  props: ["id"],
  template: `
  <div id="add_show">
      <h5>Add New Show</h5>
    <form @submit.prevent="submitForm">
      <div class="mb-3">
        <label for="show" class="form-label">Show Name</label>
        <input type="text" v-model="showData.name" class="form-control" id="name" required>
      </div>
      <div class="mb-3">
        <label for="start_time" class="form-label">Show's Start Time</label>
        <input type="datetime-local" v-model="showData.start_time" class="form-control" id="start_time" required>
      </div>
      <div class="mb-3">
        <label for="end_time" class="form-label">Show's End Time</label>
        <input type="datetime-local" v-model="showData.end_time" class="form-control" id="end_time" required>
      </div>
      <div class="mb-3">
        <label for="price" class="form-label">Price</label>
        <input type="number" v-model="showData.price" class="form-control" id="price" required>
      </div>
      <div class="mb-3">
        <label for="tags" class="form-label">Tags</label>
        <input type="text" v-model="showData.tags" class="form-control" id="tags" aria-describedby="Help" required>
        <div id="Help" class="form-text">Enter all tags related to the show separated by commas.</div>
      </div>
      <button type="submit" @click="submitForm" :disabled="isLoading" class="btn btn-primary">Submit</button>
  </form>
</div>

  </div>
  `,
  data: function () {
    return {
      title: "Add new Show",
      showData: {
        /*id: fields.Integer,*/
        /*theatre_id: fields.Integer,*/
        name: "",
        /*rating: fields.Float,*/
        start_time: "",
        end_time: "",
        price: 0,
        tags: "",
        /*show_capacity : fields.Integer*/
      },
      isLoading : false,
      errors: [],
    };
  },

  methods: {
    
    submitForm: async function () {
      this.isLoading = true;
      let token = sessionStorage.getItem("token");
      let theatreid = this.$route.params.id;
      console.log(this.showData.start_time);
      await fetch(`/api/theatre/${theatreid}/show`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "name": this.showData.name, 
          "start_time": this.showData.start_time, 
          "end_time": this.showData.end_time,
          "price": this.showData.price,
          "tags": this.showData.tags
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
            alert("Show Created!");
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
