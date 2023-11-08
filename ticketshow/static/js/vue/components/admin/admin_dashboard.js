Vue.component("dshow", {
  props: ["dataObj", "dex"],
  template: `
    <div class="container" style="padding-top: 10px;">
        <div class="row bg-light border border-secondary border-rounded">
            <div class="col-md-12" style="padding-top: 8px;">
                <div class="row">
                    <div class="col-md-4 ">
                        <h6>{{dataObj.name}}</h6>
                    </div>
                    <div class="col-md-4 d-flex justify-content-center">
                        <p>price: {{ dataObj.price }}</p>
                    </div>
                    <div class="col-md-3">
                        <div class="d-flex justify-content-center">
                            <div class="dropdown">
                                <button class="btn btn-sm align-center btn-primary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    Actions
                                </button>
                                <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                    <a class="dropdown-item" @click="deleteShow(dataObj.id , dex)">Delete Show</a>
                                    <router-link type="button card-link" class="dropdown-item" :to="{name: 'edit_show', params: { id : dataObj.id}}"  tag="button">Edit Show</router-link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row">
                        <p>Timing: {{ formatDateTime(dataObj.start_time) }} - {{ formatDateTime(dataObj.end_time) }}</p>
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

    deleteShow: async function (s_id , dex) {
      let token = sessionStorage.getItem("token");
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this show?"
      );

      if (!confirmDelete) {
        // If the user clicked "Cancel," do nothing and exit the method
        return;
      } else {
        await fetch(`/api/show/${s_id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
          .then((response) =>
            response
              .json()
              .then((jdata) => ({ response: response, data: jdata }))
          )
          .then(({ response, data }) => {
            if (!response.ok) {
              throw new Error(`Error ${response.status}: ${data.description}`);
            } else {
              this.$emit("show-deleted", dex);
              alert("Show Deleted!");
            }
          })
          .catch((error) => {
            if (error.message.includes("Token has expired")) {
              alert("Re-login required, token has expired");
              this.$router.push("/relogin");
            }
            alert(error.message, "Error");
            //console.log(error)
          });
      }
    },
  },
});

//---------------------------------------------------------------------Theatre Component---------------------------------------------------------------------------------------------------------------------
Vue.component("dtheatre", {
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
                        <dshow v-for="(show, index) in show_data" :dataObj="show" :dex="index" :key="show.id" @show-deleted="handleShowDeleted"></dshow>
                    </div>           
                </div>
                <div class="text-center card-footer">
                    <router-link type="button card-link" class="btn btn-outline-primary btn-sm" :to="{name: 'add_show', params: { id : dataObj.id}}" tag="button">Add Show</router-link>
                    <router-link type="button card-link" class="btn btn-outline-success btn-sm" :to="{name: 'edit_theatre', params: { id: dataObj.id}}" tag="button">Edit Theatre</router-link>
                    <div class="btn-group">
                    <button id="btnGroupDrop1" type="button" class="btn btn-outline-secondary btn-sm dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                      More
                    </button>
                    <div class="dropdown-menu" aria-labelledby="btnGroupDrop1">
                      <a class="dropdown-item" @click="deleteTheatre(dataObj.id , dex)">Delete Theatre</a>
                      <a class="dropdown-item" @click="export_pdf(dataObj.id)">Export as PDF</a>
                      <a class="dropdown-item" @click="export_csv(dataObj.id)">Export as CSV</a>
                    </div>
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

  methods: {
    deleteTheatre: async function (t_id , dex) {
      let token = sessionStorage.getItem("token");
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this show?"
      );

      if (!confirmDelete) {
        // If the user clicked "Cancel," do nothing and exit the method
        return;
      } else {
        await fetch(`/api/theatre/${t_id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
          .then((response) =>
            response
              .json()
              .then((jdata) => ({ response: response, data: jdata }))
          )
          .then(({ response, data }) => {
            if (!response.ok) {
              throw new Error(`Error ${response.status}: ${data.description}`);
            } else {
              this.$emit("theatre-deleted", dex);
              alert("Theater deleted successfully.");
            }
          })
          .catch((error) => {
            if (error.message.includes("Token has expired")) {
              alert("Re-login required, token has expired" + "Error");
              this.$router.push("/relogin");
            }
            alert(error.message + "Error");
            //console.log(error)
          });
      }
    },

    export_csv: async function (t_id) {
      let token = sessionStorage.getItem("token");
      
      await fetch(`/api/export_theatre_csv/${t_id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((response) =>
          response
            .json()
            .then((jdata) => ({ response: response, data: jdata }))
        )
        .then(({ response, data }) => {
          if (!response.ok) {
            throw new Error(`Error ${response.status}: ${data.description}`);
          } else {
            alert("Export Done!");
          }
        })
        .catch((error) => {
          if (error.message.includes("Token has expired")) {
            alert("Re-login required, token has expired" + "Error");
            this.$router.push("/relogin");
          }
          alert(error.message + "Error");
          //console.log(error)
        });
    },

    export_pdf: async function (t_id) {
      let token = sessionStorage.getItem("token");
      
      await fetch(`/api/export_theatre_pdf/${t_id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((response) =>
          response
            .json()
            .then((jdata) => ({ response: response, data: jdata }))
        )
        .then(({ response, data }) => {
          if (!response.ok) {
            throw new Error(`Error ${response.status}: ${data.description}`);
          } else {
            alert("Export Done!");
          }
        })
        .catch((error) => {
          if (error.message.includes("Token has expired")) {
            alert("Re-login required, token has expired" + "Error");
            this.$router.push("/relogin");
          }
          alert(error.message + "Error");
          //console.log(error)
        });
    },

    handleShowDeleted(dex) {
      // Remove the deleted show from show_data array
      this.show_data.splice(dex, 1);
    }
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

export const admin_dashboard = {
  template: `
    <div id="admin_dashboard">
            <h3>Hi, {{ user }} :) </h3>
            <div style="display: flex; flex-wrap: wrap; justify-content: center;">
            <div class="row">
                <dtheatre v-for="(theatre, index) in theatre_data" :dataObj="theatre" :dex="index" :key="theatre.id" @theatre-deleted="handleTheatreDeleted"></dtheatre>
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

  methods: {
    handleTheatreDeleted(dex) {
      // Remove the deleted theater from theatre_data array
      this.theatre_data.splice(dex, 1);
    },
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
