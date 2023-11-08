Vue.component("ushow", {
  props: ["dataObj", "dex"],
  template: `
  <div v-show="isShowVisible">
    <div class="container" style="padding-top: 10px;">
        <div class="row bg-light border border-dark">
            <div class="col-md-12">
                <div class="row">
                  <h5>{{dataObj.name}}</h5>
                </div>
                <div class="row">
                  <div class="col-sm-6">
                    <div>price: {{ dataObj.price }}</div>
                  </div>
                  <div class="col-sm-6">
                    <div>seats left : {{ dataObj.show_capacity }}</div>
                  </div>    
                </div>
                <div class="row">
                        <p>Timing: {{ formatDateTime(dataObj.start_time) }} - {{ formatDateTime(dataObj.end_time) }}</p>
                </div>
                <div class="row">
                  <router-link v-if="dataObj.show_capacity > 0" :to="{name: 'book_show' , params : {id : dataObj.id}}" class="btn btn-outline-dark btn-sm" tag="button">BOOK</router-link>
                  <button v-else type="button" class="btn btn-danger btn-sm" disabled>Houseful</button>
                </div>

            </div>

        </div>
    </div>
  </div>
`,

  data: function () {
    return {
      user: sessionStorage.getItem("username"),
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
  },
  computed: {
    isShowVisible() {
      const currentTime = new Date().getTime();
      const startTime = new Date(this.dataObj.start_time).getTime();
      return currentTime < startTime;
    }
  },
});

//---------------------------------------------------------------------Theatre Component---------------------------------------------------------------------------------------------------------------------
Vue.component("utheatre", {
  props: ["dataObj", "dex"],
  template: `
        <div class="col-sm-4">
            <div class="card" style="width: 25rem;min-height:250px;margin:10px;">
                <div class="card-header">
                    <h5 class=" d-flex justify-content-center">{{dataObj.name}}</h5>
                  <p class="d-flex justify-content-center">{{dataObj.address}},{{dataObj.city}}</p>
                  <p class="d-flex justify-content-center">Venue Capacity : {{dataObj.capacity}}</p>
                </div>
                <div class="card-body">
                    <div class="row">
                        <ushow v-for="(show, index) in show_data" :dataObj="show" :dex="index" :key="show.id"></ushow>
                    </div>           
                </div>
                
            </div>
        </div>`,

  data: function () {
    return {
      show_data: null,
      user: sessionStorage.getItem("username"),
    };
  },

  mounted: async function () {
    let token = sessionStorage.getItem("token");
    await fetch(`/api/theatre/${this.dataObj.id}/show`, {
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
        this.show_data = data;
      })
      .catch((error) => {
        if (error.message.includes("Token has expired")) {
          window.alert("Re-login required, token has expired", "Error");
          this.$router.push("/relogin");
        }
        window.alert(error.message, "Error");
        //console.log(error)
      });
  },
});

//---------------------------------------------------------------------Dashboard Component---------------------------------------------------------------------------------------------------------------------

export const user_dashboard = {
  template: `
    <div id="user_dashboard">
            <h3>Hi, {{ user }} :) </h3>
            <div style="display: flex; flex-wrap: wrap; justify-content: center;">
            <div class="row">
                <utheatre v-for="(theatre, index) in theatre_data" :dataObj="theatre" :dex="index" :key="theatre.id"></utheatre>
            </div>
            </div>
    </div>


    `,
  data: function () {
    return {
      theatre_data: null,
      user: sessionStorage.getItem("username"),
    };
  },

  mounted: async function () {
    let token = sessionStorage.getItem("token");
    await fetch("/api/theatre", {
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
        this.theatre_data = data;
      })
      .catch((error) => {
        if (error.message.includes("Token has expired")) {
          window.alert("Re-login required, token has expired");
          this.$router.push("/relogin");
        }
        window.alert("Error: " + error.message);
        //console.log(error)
      });
  },
};
