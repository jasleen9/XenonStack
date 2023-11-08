import { get_show_data } from "../common.js";

export const book_show = {
  props : ['id'],
  template: `
  <div id="book_show">
    <h3>Book Show : {{ show.name }} !</h3>
    <h6>Timing : {{ show.start_time }} - {{ show.end_time }}</h6>
    <h6>Seats Left : {{ show.show_capacity }} </h6>

    <form @submit.prevent="submitForm">
      <div class="mb-3">
        <label for="seats" class="form-label">Number of Seats to be booked :</label>
        <input type="text" v-model="seats" :max="show.show_capacity" class="form-control" id="name" required>
      </div>
      <div class="mb-3">
        <p>Price : {{ show.price }} </p>
      </div>
      <div class="mb-3">
        <p>Total Amount to be paid : {{ amount }} </p>
      </div>
      <button type="submit" @click="submitForm" :disabled="isLoading" class="btn btn-primary">Submit</button>
  </form>
</div>

  </div>
  `,
  data: function () {
    return {
      show: {
        name: '',
        start_time: '',
        end_time: '',
        price: 0,
        tags: '',
        show_capacity:0
      },
      seats: 0,
      amount:0,
      isLoading: false,
      errors: []
    };
  },

  methods: {
    
    submitForm: async function () {
      this.isLoading = true;
      let token = sessionStorage.getItem("token");
      let showid = this.$route.params.id;
      await fetch(`/api/book/show/${showid}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "seats": this.seats, 
      })
      })
        .then((response) =>
          response
            .json()
            .then((jdata) => ({ response: response, data: jdata }))
        )
        .then(({ response, data }) => {
          console.log(response)
          if (!response.ok) {
            this.isLoading = false;
            console.log(data)
            throw new Error(`Error ${response.status}: ${data.description}`);
          } else {
            console.log(response)
            this.isLoading = false;
            this.$router.push({ name: 'user_home' });
            alert("You have booked "+ data.seats + " seats");
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

  mounted: async function () {
    let sdata = get_show_data(this.$route.params.id);
    sdata.then(data => {
      this.show = data;
    }).catch(error => {
      alert(error.message);
      this.$router.push({ name: 'user_home' });
    });
  },

  watch: {
    seats: function() {
      this.amount = this.seats * this.show.price;
    },
  },
};
