export const login_page = {
    data: () => ({
        email: '',
        password: '',
        is_admin:null,
      }),
    
      
    mounted: function(){
        if(this.$router.currentRoute.name == "logout"){
            sessionStorage.clear();
            this.$router.push({name: "login"})
        }else if(this.$router.currentRoute.name == "relogin"){
            sessionStorage.clear();
        }
    },

    methods: {
        authenticate: function() {
            console.log('auth start')
            fetch('/api/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({"email": this.email, "password": this.password})
            })
            .then(response => response.json().then(jdata=> ({response: response, data: jdata})))
            .then(({response, data}) => {
                if(!response.ok){  
                    console.log('error')                  
                    throw new Error(`Error ${response.status}: ${data.description}`)
                } else {
                    if(data.is_admin === true){
                        console.log('admin')
                        sessionStorage.setItem("username", data.name)
                        sessionStorage.setItem("token", data.token)
                        sessionStorage.setItem("is_admin",data.is_admin)
                        this.$router.push({name:"admin_home"})
                    }
                    if(data.is_admin === false) {
                        console.log('user')
                        sessionStorage.setItem("username", data.name)
                        sessionStorage.setItem("token", data.token)
                        sessionStorage.setItem("is_admin",data.is_admin)
                        this.$router.push({name:"user_home"})
                    }
                        
                }
            })
            .catch((error) => {
                alert(error.message, "Error");
              })
        }
    },

    template: `
    <div id="login_page">
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
            <div class="container-fluid">
                <div class="navbar-brand">Ticket Show v2</div>
            </div>
        </nav>
        <div class="container">      
            <div class="row overflow-auto">      
                <div class="col col-1"></div>
                <div class="col col-11">
                    <div class="col col-11 page-top-box">
                        <div class="row justify-content-md-center">
                            <div class="col-md-6 login-form">
                                <div class="row justify-content-md-center">
                                    <div class="col-md-auto">                    
                                        <h2 class="page-head">
                                            Login - Ticket Show App v2<hr>
                                        </h2>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="email">Email Address</label>
                                    <input class="form-control" v-model="email"  id="email" name="email" required type="text">
                                </div>
                                <div class="form-group">
                                    <label for="password">Password</label>
                                    <input class="form-control"  id="password" v-model="password" required type="password">
                                </div>

                                <div class="form-group">
                                    <button class="form-control bg-light" @click="authenticate">Submit</button>
                                </div>
                                <div>
                                    Don't have an account? <router-link :to="{name:'register'}">Register Here</router-link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>    
                <div class="row">
                    <div class="col-12" style="min-height:100px;"></div>
                </div>
            </div>
        </div>
    </div>`
}





export const register_page = {
    data: () => ({
        name: null,
        email: null,
        password: null
      }),
    

    methods: {
    registerUser: async function() {
        console.log('auth start')
        await fetch('/api/register', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({"name": this.name, "email": this.email, "password": this.password})
        })
        .then(response => response.json().then(jdata=> ({response: response, data: jdata})))
        .then(({response, data}) => {
            if(!response.ok){                    
                throw new Error(`Error ${response.status}: ${data.description}`)
            } else {
                console.log('auth done')
                this.$router.push({name:"login"})
            }
        })
        .catch((error) => {
            alert(error.message, "Error");
          })
    }
    },

    template: `
    <div id="register_page">
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
            <div class="container-fluid">
                 <div class="navbar-brand">Ticket Show v2</div>>
            </div>
        </nav>
        <div class="container">      
            <div class="row overflow-auto">      
                <div class="col col-1"></div>
                <div class="col col-11">
                    <div class="col col-11 page-top-box">
                        <div class="row justify-content-md-center">
                            <div class="col-md-6 login-form">
                                <div class="row justify-content-md-center">
                                    <div class="col-md-auto">                    
                                        <h2 class="page-head">
                                            Sign Up!<hr>
                                        </h2>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="name">Full Name</label>
                                    <input class="form-control" id="name" v-model="name" required type="text">
                                </div>
                                <div class="form-group">
                                    <label for="email">Email Address</label>
                                    <input class="form-control" id="email" v-model="email" required type="text">
                                </div>

                                <div class="form-group">
                                    <label for="password">Password</label>
                                    <input class="form-control"  id="password" v-model="password" required type="password">
                                </div>

                                <div class="form-group">
                                    <button class="form-control" v-on:click="registerUser">Sign-Up</button>
                                </div>
                                <div>
                                    Already Registered? <router-link :to="{name:'login'}">Login Now!</router-link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>    
                <div class="row">
                    <div class="col-12" style="min-height:100px;"></div>
                </div>
            </div>
        </div>
    </div>`
}
