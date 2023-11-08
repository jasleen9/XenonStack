export let get_theatre_data = async function(id){
    console.log(`Getting data of theatre with ID ${id}`)
    let token = sessionStorage.getItem("token")
    let final_data = null
    await fetch(`/api/theatre/${id}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        
    })
    .then(response => response.json().then(jdata=> ({response: response, data: jdata})))
    .then(({response, data}) => {
        if(!response.ok){
            throw new Error(`Error ${response.status}: ${data.description}`)
        } else {            
            final_data = data
        }
    })
    .catch(error => {
        if(error.message.includes("Token has expired")){
            alert("Re-login required, token has expired")
            this.$router.push("/relogin")
        }
        alert(error.message, 'Error')
        //console.log(error)
    })
    
    return final_data
}




export let get_show_data = async function(id){
    console.log(`Getting data of show with ID ${id}`)
    let token = sessionStorage.getItem("token")
    let final_data = null
    await fetch(`/api/show/${id}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        
    })
    .then(response => response.json().then(jdata=> ({response: response, data: jdata})))
    .then(({response, data}) => {
        if(!response.ok){
            throw new Error(`Error ${response.status}: ${data.description}`)
        } else {            
            final_data = data
        }
    })
    .catch(error => {
        if(error.message.includes("Token has expired")){
            alert("Re-login required, token has expired")
            this.$router.push("/relogin")
        }
        alert(error.message, 'Error');
        //console.log(error)
    })
    
    return final_data
}



export let get_booking_data = async function(id){
    console.log(`Getting data of booking with ID ${id}`)
    let token = sessionStorage.getItem("token")
    let final_data = null
    await fetch(`/api/bookings`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        
    })
    .then(response => response.json().then(jdata=> ({response: response, data: jdata})))
    .then(({response, data}) => {
        if(!response.ok){
            throw new Error(`Error ${response.status}: ${data.description}`)
        } else {            
            final_data = data
        }
    })
    .catch(error => {
        if(error.message.includes("Token has expired")){
            toastr.error("Re-login required, token has expired", 'Error')
            this.$router.push("/relogin")
        }
        toastr.error(error.message, 'Error')
        //console.log(error)
    })
    
    return final_data
}


export const admin_common = {
    template: `
    <div id="body">
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
            <div class="container-fluid">
                <router-link class="text-decoration-none text-light" :to="{name: 'admin_home'}"><h3>Ticket Show v2</h3></router-link>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>

                <div class="collapse navbar-collapse" id="navbarSupportedContent">
                    <div class="col-8"></div>
                    <ul class="navbar-nav">
                        <li class="nav-item">
                            <div class="search-form">
                              <input v-model="searchQuery" placeholder="Enter city or tags">
                              <button class="btn btn-outline-secondary btn-sm" @click="search_show">Search Shows</button>
                              <button class="btn btn-outline-secondary btn-sm" @click="search_theatre">Search Theatres</button>
                            </div>
                            <router-link type="button card-link" class="btn btn-outline-light btn-sm" :to="{name: 'add_theatre'}" tag="button">Add Theatre</router-link>
                            <router-link type="button card-link" class="btn btn-outline-light btn-sm" :to="{name: 'logout'}" tag="button">logout</router-link>
                        </li>
                    </ul>

                </div>
            </div>
        </nav>

        <div v-show="is_search">
            <div v-if="searchResults.length > 0">
                <h3>Search Results</h3>
                    <ul>
                      <li v-for="(result, index) in searchResults" :key="index">{{ result.name }}</li>
                    </ul>
                 <button @click="closeSearchResults">close</button>
            </div>
            <div v-else>
                <h3>Search Results</h3>
                    <p>No matching results found!</p>
                 <button @click="closeSearchResults">close</button>
            </div>
        </div>


        <div id="page">
            <div class="container">      
                <div class="row overflow-auto">      
                    <div class="col col-1"></div>
                    <div class="col col-11">
                        <router-view></router-view>
                    </div>
                </div>
                <div class="row">
                    <div class="col-12" style="min-height:100px;"></div>
                </div>
            </div>
        </div>
    </div>`,

    data: function () {
        return {
          searchQuery: "",
          searchResults:[],
          is_search : false
        };
      },

    methods: {
        search_show : async function(){
            let token = sessionStorage.getItem("token")
            await fetch(`/api/search/shows?tag=${encodeURIComponent(this.searchQuery)}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                
            })
            .then(response => response.json().then(jdata=> ({response: response, data: jdata})))
            .then(({response, data}) => {
                if(!response.ok){
                    throw new Error(`Error ${response.status}: ${data.description}`)
                } else {  
                    this.is_search = true          
                    this.searchResults = data
                }
            })
            .catch(error => {
                if(error.message.includes("Token has expired")){
                    alert("Re-login required, token has expired")
                    this.$router.push("/relogin")
                }
                alert(error.message, 'Error');
                //console.log(error)
            })
            
        },
        search_theatre : async function(){
            let token = sessionStorage.getItem("token")
            await fetch(`/api/search/theatres?city=${encodeURIComponent(this.searchQuery)}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                
            })
            .then(response => response.json().then(jdata=> ({response: response, data: jdata})))
            .then(({response, data}) => {
                if(!response.ok){
                    throw new Error(`Error ${response.status}: ${data.description}`)
                } else {  
                    this.is_search = true          
                    this.searchResults = data
                }
            })
            .catch(error => {
                if(error.message.includes("Token has expired")){
                    alert("Re-login required, token has expired")
                    this.$router.push("/relogin")
                }
                alert(error.message, 'Error');
                //console.log(error)
            })
            
        },

        closeSearchResults() {
            this.is_search = false;
          }
    },
    
    beforeCreate: function(){
        if(sessionStorage.getItem("token") === null){
            this.$router.push({name:"login"})
        }
        else{
            if(!(sessionStorage.getItem("is_admin"))){
                this.$router.push({name:"user_home"})   
            }
        }
    },

    
}


export const user_common = {
    template: `
    <div id="body">
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
            <div class="container-fluid">
            <router-link class="text-decoration-none text-light" :to="{name: 'user_home'}"><h3>Ticket Show v2</h3></router-link>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>

                <div class="collapse navbar-collapse" id="navbarSupportedContent">
                    <div class="col-8"></div>
                    <ul class="navbar-nav">
                        <li class="nav-item">
                            <div class="search-form">
                               <input v-model="searchQuery" placeholder="Enter city or tags">
                               <button class="btn btn-outline-secondary btn-sm" @click="search_show">Search Shows</button>
                               <button class="btn btn-outline-secondary btn-sm" @click="search_theatre">Search Theatres</button>
                            </div>
                            <router-link type="button card-link" class="btn btn-outline-light btn-sm" :to="{ name: 'user_bookings' } ">My Bookings</router-link>
                            <router-link type="button card-link" class="btn btn-outline-light btn-sm" :to="{ name: 'logout' }">logout</router-link>
                        </li>
                    </ul>

                </div>
            </div>
        </nav>

        <div v-show="is_search">
            <div v-if="searchResults.length > 0">
                <h3>Search Results</h3>
                    <ul>
                      <li v-for="(result, index) in searchResults" :key="index">{{ result.name }}</li>
                    </ul>
                 <button @click="closeSearchResults">close</button>
            </div>
            <div v-else>
                <h3>Search Results</h3>
                    <p>No matching results found!</p>
                 <button @click="closeSearchResults">close</button>
            </div>
        </div>

        <div id="page">
            <div class="container">      
                <div class="row overflow-auto">      
                    <div class="col col-1"></div>
                    <div class="col col-11">
                        <router-view></router-view>
                    </div>
                </div>
                <div class="row">
                    <div class="col-12" style="min-height:100px;"></div>
                </div>
            </div>
        </div>
    </div>`,

    data: function () {
        return {
          searchQuery: "",
          searchResults:[],
          is_search : false
        };
      },

    methods: {
        search_show : async function(){
            let token = sessionStorage.getItem("token")
            await fetch(`/api/search/shows?tag=${encodeURIComponent(this.searchQuery)}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                
            })
            .then(response => response.json().then(jdata=> ({response: response, data: jdata})))
            .then(({response, data}) => {
                if(!response.ok){
                    throw new Error(`Error ${response.status}: ${data.description}`)
                } else {  
                    this.is_search = true          
                    this.searchResults = data
                }
            })
            .catch(error => {
                if(error.message.includes("Token has expired")){
                    alert("Re-login required, token has expired")
                    this.$router.push("/relogin")
                }
                alert(error.message, 'Error');
                //console.log(error)
            })
            
        },
        search_theatre : async function(){
            let token = sessionStorage.getItem("token")
            await fetch(`/api/search/theatres?city=${encodeURIComponent(this.searchQuery)}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                
            })
            .then(response => response.json().then(jdata=> ({response: response, data: jdata})))
            .then(({response, data}) => {
                if(!response.ok){
                    throw new Error(`Error ${response.status}: ${data.description}`)
                } else {  
                    this.is_search = true          
                    this.searchResults = data
                }
            })
            .catch(error => {
                if(error.message.includes("Token has expired")){
                    alert("Re-login required, token has expired")
                    this.$router.push("/relogin")
                }
                alert(error.message, 'Error');
                //console.log(error)
            })
            
        },

        closeSearchResults() {
            this.is_search = false;
          }
    },
   
    beforeCreate: function(){
        if(sessionStorage.getItem("token") === null){
            this.$router.push({name:"login"})
        }
    }
}