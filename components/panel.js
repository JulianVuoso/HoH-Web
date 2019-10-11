Vue.component('panel', {
  data() {
    return {
      device: { name: "No Device Selected", room: { name: "Please Select a Device" }, type: { name: "" }, meta: { favorite: false } },
      selected: false,
      settings: false,

      snackbarCan: false,
      snackbarOk: false,
      snackbarMsg: ''
    }
  },
  template:
    `<v-navigation-drawer bottom app floating clipped right permanent color='#E9E9E9' :width="getWidth">
      <!-- header -->
      <template v-slot:prepend >
        <v-list-item two-line class="mb-2 mt-1">
          <v-list-item-avatar tile>
            <v-img eager :src="getImg" contain/>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title class="text-capitalize">{{ device.name }}</v-list-item-title>
            <v-list-item-subtitle class="text-capitalize">{{ device.room.name }}</v-list-item-subtitle>
          </v-list-item-content>
          <v-btn icon v-show="selected" @click="toggleFavorite">
            <v-icon v-show="device.meta.favorite">mdi-star</v-icon>
            <v-icon v-show="!device.meta.favorite">mdi-star-outline</v-icon>
          </v-btn>
          <v-btn icon v-show="selected" @click="settings = true">
            <v-icon>mdi-settings</v-icon>
          </v-btn>
        </v-list-item>
      </template>
      <v-divider class="mx-5"></v-divider>        
      
      <component v-show="settings" :is="getComp" :device="device"> </component>

      <!-- information and settings -->
      <component :is="getPanelContent" :device="device"></component>

      <v-snackbar v-model="snackbarOk" > {{snackbarMsg}}
              <v-btn color="green" text @click="snackbarOk = false"> OK </v-btn>
      </v-snackbar>
      <v-snackbar v-model="snackbarCan" > {{snackbarMsg}}
              <v-btn color="red" text @click="snackbarCan = false"> OK </v-btn>
      </v-snackbar>
    </v-navigation-drawer>`,
  methods: {
    async toggleFavorite() {
      this.device.meta.favorite = !this.device.meta.favorite;
      console.log(this.device);
      let rta = await modifyDevice(this.device.id, this.device.name, this.device.meta.favorite)
        .catch((error) => {
          this.errorMsg = error[0].toUpperCase() + error.slice(1);
          console.error(this.errorMsg);
        });
      if (rta) {
        console.log(rta.result);
      } else {
        this.error = true;
      }
    }
  },
  computed: {
    getComp() {
      if (this.selected)
        return 'edit-device';
    },
    getImg() {
      switch (this.device.type.name) {
        case "lamp":
          return './resources/icons/web/lamp_on.svg';
        case "vacuum":
          return './resources/icons/web/vacuum_on.svg';
        case "ac":
          return './resources/icons/web/air_conditioner_on.svg';
        case "door":
          return './resources/icons/web/door_closed.svg';
        case "blinds":
          return './resources/icons/web/window_closed.svg';
        case "speaker":
          return './resources/icons/web/speaker_playing.svg';
        case "oven":
          return './resources/icons/web/oven_on.svg';
        case "refrigerator":
          return './resources/icons/web/fridge.svg'
        default:
          return './resources/icons/generic/close.svg';
      }
    },
    getPanelContent() {
      switch (this.device.type.name) {
        case "lamp":
          return "panel-light";
        case "ac":
          return "panel-airconditioner";
        case "door":
          return "panel-door";
        case "blinds":
          return "panel-window";
        case "speaker":
          return "panel-speaker";
        case "oven":
          return "panel-oven";
        case "refrigerator":
          return "panel-refrigerator"
        default:
          return "panel-none";
      }
    },
    getWidth() {
      return screen.width / 5;
    }
  },
  async mounted() {
    this.$root.$on('Device Selected', (device) => {
      this.device = device;
      this.selected = true;
      console.log('Message recieved with ' + this.device);
    });
    this.$root.$on('Device Deselected', () => {
      this.device = { name: "No Device Selected", room: { name: "Please Select a Device" }, type: { name: "" }, meta: { favorite: false } };
      this.selected = false;
    });
    this.$root.$on('Finished edit', (name, exit) => {
      this.settings = false;
      this.device.name = name;
      if (exit) {
        this.device = { name: "No Device Selected", room: { name: "Please Select a Device" }, type: { name: "" }, meta: { favorite: false } };
        this.selected = false;
      }
    });
  }
})

Vue.component('edit-device', {
  props: {
    device: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      name: this.device.name,
      overlay: true,
      rooms: [],
      // room: { name: this.device.room.name, id: this.device.room.id },
      room: this.device.room.id,
      types: [],
      type: { name: this.device.type.name[0].toUpperCase() + this.device.type.name.slice(1), id: this.device.type.id },
      dialog: false,
      error: false,
      errorText: false,
      errorMsg: ''
    }
  },
  watch: { // here we set the new values

  },
  template:
    `<v-container fluid>
      <v-overlay>
        <v-card max-width="700" light>
          <v-card-title>
              <span class="headline">Editing "{{device.name}}"</span>
              <v-row justify="end">
              <v-btn right class="mx-5" icon @click="dialog = true">
                <v-icon size="40">mdi-delete</v-icon>
              </v-btn>
              </v-row>
          </v-card-title>

          <v-card-text>
              <v-container>
              <v-row>
                  <v-col cols="12">
                  <v-text-field v-model="name" label="Name" :error="errorText" required hint="Between 3 and 60 letters, numbers or spaces." clearable></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6">
                      <v-select v-model="room" :items="rooms" item-text="name" item-value="id" :value="room" label="Room" required></v-select>
                  </v-col>
                  <v-col cols="12" sm="6">
                      <v-select disabled :label="type.name" required></v-select>
                  </v-col>
              </v-row>
              </v-container>
          </v-card-text>
          <v-card-actions>
              <div class="flex-grow-1"></div>
              <v-btn color="red darken-1" text @click="cancel()">Cancel</v-btn>
              <v-btn color="green darken-1" text @click="apply()">Apply</v-btn>
          </v-card-actions>
        </v-card>
      </v-overlay>
      <v-snackbar v-model="error" > {{ errorMsg }}
        <v-btn color="red" text @click="error = false; errorText = false"> OK </v-btn>
      </v-snackbar>
     
      <!-- Cannot use css with v-dialog  -->
      <v-dialog v-model="dialog" persistent width="410">        
        <v-card>
          <v-card-title>Device: {{name}}</v-card-title>
          <v-card-text class="body-1">Are you sure you want to delete it?</v-card-text>
          <v-card-actions>
            <div class="flex-grow-1"></div>
            <v-btn color="red darken-1" text @click="cancelRemove()">Cancel</v-btn>
            <v-btn color="green darken-1" text @click="removeDevice()">Delete</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>`,
  methods: {
    async apply() {
      if (this.name.length < 3 || this.name.length > 60) {
        this.errorMsg = 'Name must have between 3 and 60 characters!';
        this.error = true;
        this.errorText = true;
      } else if (!/^([a-zA-Z0-9 _]+)$/.test(this.name)) {
        this.errorMsg = 'Name must have letters, numbers or spaces!';
        this.error = true;
        this.errorText = true;
      } else {
        this.device.name = this.name;
        // this.device.room.id = this.room;
        let rta = await modifyDevice(this.device.id, this.name, this.device.meta.favorite)
          .catch((error) => {
            this.errorMsg = error[0].toUpperCase() + error.slice(1);
            console.error(this.errorMsg);
          });
        if (rta) {
          let roomChanged = (this.room != this.device.room.id);
          if (roomChanged) {
            let rta = await deleteDeviceFromRoom(this.device.id)
              .catch((error) => {
                this.errorMsg = error[0].toUpperCase() + error.slice(1);
                console.error(this.errorMsg);
              });
            if (rta) {
              let rta = await addDeviceToRoom(this.room, this.device.id)
                .catch((error) => {
                  this.errorMsg = error[0].toUpperCase() + error.slice(1);
                  console.error(this.errorMsg);
                });
              if (!rta) {
                this.error = true;
              }
            } else {
              this.error = true;
            }
          }
          if (!this.error) {
            this.resetVar();
            this.$root.$emit('Finished edit', this.name, roomChanged);
            this.$root.$emit('Finished add', 2);
          }
        } else {
          this.error = true;
        }
      }
    },
    cancel() {
      this.resetVar();
      this.$root.$emit('Finished edit', this.name, false);
      this.$root.$emit('Finished add', 1);
    },
    cancelRemove() {
      this.dialog = false;
      this.$root.$emit('Finished add', 1);
    },
    async removeDevice() {
      this.dialog = false;

      let rta = await deleteDevice(this.device.id)
        .catch((error) => {
          this.errorMsg = error[0].toUpperCase() + error.slice(1);
          console.error(this.errorMsg);
        });
      if (rta) {
        this.resetVar();
        this.$root.$emit('Finished edit', this.name, true);
        this.$root.$emit('Finished add', 3);
        window.location.reload();
      } else {
        this.error = true;
      }
    },
    resetVar() {
      this.name = this.device.name;
      this.room = this.device.room.id;
      this.overlay = false;
      this.error = false;
      this.errorText = false;
    }
  },
  async mounted() {
    // here we extract all the data
    let rta = await getAll("Room")
      .catch((error) => {
        this.errorMsg = error[0].toUpperCase() + error.slice(1);
        console.error(this.errorMsg);
      });
    if (rta) {
      for (i of rta.result) {
        var el = { name: i.name, id: i.id };
        this.rooms.push(el);
      }
      this.overlay = true;
    } else {
      this.error = true;
    }
  }
})

Vue.component('panel-none', {
  props: {
    device: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      closed: 0, // 0: closed, 1: open
    }
  },
  template:
    `<v-container fluid>
      <div class="mt-5 ma-1 title font-weight-bold">Hello Julian Ajax!</div>
      <div class="mb-5 ma-1 ">Welcome to your smart house! Here we have some tips for you.</div>
      
      <v-card dark class="mt-5 mb-5 ma-1">
        <v-card-title>Add a Device</v-card-title>
        <v-card-text>Search for the + button in the bottom right part of 
        any page and start adding new Devices</v-card-text>
      </v-card>
      
      <v-card dark class="mb-5 ma-1">
        <v-card-title>Device Settings</v-card-title>
        <v-card-text>Here in this panel are going to be shown the settings of the device 
        selected. Click on one to get started!</v-card-text>
      </v-card>
       
      <v-card dark class="mb-5 ma-1">
        <v-card-title>Tabs</v-card-title>
        <v-card-text>There are some tabs so you can find your devices faster! 
        Just click on them and choose the category you need.</v-card-text>
      </v-card>
    </v-container>`,
  mounted() {
    // here we extract all the data
  }
})

Vue.component('panel-light', {
  props: {
    device: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      state: (this.device.state.status == "on"),
      color: "#" + this.device.state.color,
      brightness: this.device.state.brightness,
      error: false,
      errorMsg: '',
    }
  },
  watch: { // here we set the new values
    state(newVal, oldVal) {
      if (newVal) {
        this.sendAction("turnOn", []);
      } else {
        this.sendAction("turnOff", []);
      }
    },
    color(newVal, oldVal) {
      this.sendAction("setColor", [newVal.substr(1)]);
    },
    brightness(newVal, oldVal) {
      this.sendAction("setBrightness", [newVal])
    }
  },
  template:
    `<v-container fluid>
      <v-layout align-center wrap>
        <v-layout column align-end mr-2>
          <h3>Off</h3>
        </v-layout>
        <v-layout column>
          <v-switch class="align-center justify-center" v-model="state" :key="state" color="orange"></v-switch>
        </v-layout>
        <v-layout column>
          <h3>On</h3>
        </v-layout>
      </v-layout>

      <v-subheader>Color</v-subheader>
      <v-color-picker v-model="color" hide-inputs hide-mode-switch mode.sync="rgba" class="mx-auto" flat></v-color-picker>
      
      <v-subheader>Brightness</v-subheader>
      <v-slider v-model="brightness" class="mt-4" prepend-icon="mdi-brightness-6" 
        thumb-label="always" thumb-size="25" color="orange" track-color="black" thumb-color="orange darken-2"></v-slider>
    </v-container>`,
  methods: {
    updateDev(dev) {
      this.state = (dev.state.status == "on");
      this.color = "#" + dev.state.color;
      this.brightness = dev.state.brightness;
    },
    async sendAction(action, param) {
      let rta = await execAction(this.device.id, action, param)
        .catch((error) => {
          this.errorMsg = error[0].toUpperCase() + error.slice(1);
          console.error(this.errorMsg);
        });
      if (!rta) {
        this.error = true;
      }
    },
    async getData() {
      let rta = await getDevice(this.device.id)
        .catch((error) => {
          this.errorMsg = error[0].toUpperCase() + error.slice(1);
          console.error(this.errorMsg);
        });
      if (rta) {
        console.log(rta.result);
        this.updateDev(rta.result);
      } else {
        this.error = true;
      }
    }
  },
  mounted() {
    this.getData();
    let timer = setInterval(() => this.getData(), 1000);
  }
})

Vue.component('panel-oven', {
  props: {
    device: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      state: (this.device.state.status == "on"),
      temperature: this.device.state.temperature,
      heat_source: this.getHeatIndex(this.device.state.heat),
      convection_mode: this.getConvectionIndex(this.device.state.convection),
      grill_mode: this.getGrillIndex(this.device.state.grill)
    }
  },
  watch: { // here we set the new values
    state(newVal, oldVal) {
      if (newVal) {
        this.sendAction("turnOn", []);
      } else {
        this.sendAction("turnOff", []);
      }
    },
    temperature(newVal, oldVal) {
      this.sendAction("setTemperature", [newVal])
    },
    heat_source(newVal, oldVal) {
      var aux = "conventional";
      if (newVal === 0)
        aux = "top";
      else if (newVal === 1)
        aux = "bottom";
      this.sendAction("setHeat", [aux]);
    },
    convection_mode(newVal, oldVal) {
      var aux = "normal";
      if (newVal === 0)
        aux = "off";
      else if (newVal === 1)
        aux = "eco";
      this.sendAction("setConvection", [aux]);
    },
    grill_mode(newVal, oldVal) {
      var aux = "large";
      if (newVal === 0)
        aux = "off";
      else if (newVal === 1)
        aux = "eco";
      this.sendAction("setGrill", [aux]);
    }
  },
  template:
    `<v-container fluid>
      <v-layout align-center wrap>
        <v-layout column align-end mr-2>
          <h3>Off</h3>
        </v-layout>
        <v-layout column>
          <v-switch class="align-center justify-center" v-model="state" color="orange"></v-switch>
        </v-layout>
        <v-layout column>
          <h3>On</h3>
        </v-layout>
      </v-layout>
      <v-subheader>Temperature</v-subheader>
      <v-slider v-model="temperature" class="mt-4" step="10" ticks="always" tick-size="4" min="90" max="230"
        thumb-label="always" thumb-size="25" color="orange" track-color="black"
        thumb-color="orange darken-2"></v-slider>
    
      <v-subheader>Heat Source</v-subheader>
      <v-layout column align-center>
        <v-btn-toggle v-model="heat_source" tile color="orange darken-2" group mandatory>
          <v-btn>Up</v-btn>
          <v-btn>Down</v-btn>
          <v-btn>Full</v-btn>
        </v-btn-toggle>
      </v-layout>

      <v-subheader>Convection Mode</v-subheader>
      <v-layout column align-center>
        <v-btn-toggle v-model="convection_mode" tile color="orange darken-2" group mandatory>
          <v-btn>Off</v-btn>
          <v-btn>Eco</v-btn>
          <v-btn>Full</v-btn>
        </v-btn-toggle>
      </v-layout>

      <v-subheader>Grill Mode</v-subheader>
      <v-layout column align-center>
        <v-btn-toggle v-model="grill_mode" tile color="orange darken-2" group mandatory>
          <v-btn>Off</v-btn>
          <v-btn>Eco</v-btn>
          <v-btn>Full</v-btn>
        </v-btn-toggle>
      </v-layout>
    </v-container>`,
  methods: {
    async sendAction(action, param) {
      let rta = await execAction(this.device.id, action, param)
        .catch((error) => {
          this.errorMsg = error[0].toUpperCase() + error.slice(1);
          console.error(this.errorMsg);
        });
      if (!rta) {
        this.error = true;
      }
    },
    getHeatIndex(name) {
      switch (name) {
        case "top":
          return 0;
        case "bottom":
          return 1;
        case "conventional":
          return 2;
      }
    },
    getGrillIndex(name) {
      switch (name) {
        case "off":
          return 0;
        case "eco":
          return 1;
        case "large":
          return 2;
      }
    },
    getConvectionIndex(name) {
      switch (name) {
        case "off":
          return 0;
        case "eco":
          return 1;
        case "normal":
          return 2;
      }
    },
    updateDev(device) {
      this.state = (device.state.status == "on");
      this.temperature = device.state.temperature;
      this.heat_source = this.getHeatIndex(device.state.heat);
      this.convection_mode = this.getConvectionIndex(device.state.convection);
      this.grill_mode = this.getGrillIndex(device.state.grill);
    },
    async getData() {
      let rta = await getDevice(this.device.id)
        .catch((error) => {
          this.errorMsg = error[0].toUpperCase() + error.slice(1);
          console.error(this.errorMsg);
        });
      if (rta) {
        console.log(rta.result);
        this.updateDev(rta.result);
      } else {
        this.error = true;
      }
    }
  },
  mounted() {
    this.getData();
    let timer = setInterval(() => this.getData(), 1000);
  }
})

Vue.component('panel-refrigerator', {
  props: {
    device: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      temperature: this.device.state.temperature,
      freezer_temp: this.device.state.freezerTemperature,
      mode: this.getModeIndex(this.device.state.mode)
    }
  },
  watch: { // here we set the new values
    temperature(newVal, oldVal) {
      this.sendAction("setTemperature", [newVal])
    },
    freezer_temp(newVal, oldVal) {
      this.sendAction("setFreezerTemperature", [newVal])
    },
    mode(newVal, oldVal) {
      var aux = "party";
      if (newVal === 0)
        aux = "default";
      else if (newVal === 1)
        aux = "vacation";
      this.sendAction("setMode", [aux]);
    }
  },
  template:
    `<v-container fluid>
      <v-subheader class="mt-5">Temperature</v-subheader>
      <v-slider v-model="temperature" class="mt-4" step="1" ticks="always" tick-size="4" min="2" max="8"
        thumb-label="always" thumb-size="25" color="orange" track-color="black"
        thumb-color="orange darken-2"></v-slider>

      <v-subheader>Freezer Temperature</v-subheader>
      <v-slider v-model="freezer_temp" class="mt-4" step="1" ticks="always" tick-size="4" min="-20" max="-8"
        thumb-label="always" thumb-size="25" color="orange" track-color="black"
        thumb-color="orange darken-2"></v-slider>
    
      <v-subheader>Mode</v-subheader>
      <v-layout column align-center>
        <v-btn-toggle v-model="mode" tile color="orange darken-2" group mandatory>
          <v-btn>Normal</v-btn>
          <v-btn>Vacation</v-btn>
          <v-btn>Party</v-btn>
        </v-btn-toggle>
      </v-layout>

    </v-container>`,
  methods: {
    async sendAction(action, param) {
      let rta = await execAction(this.device.id, action, param)
        .catch((error) => {
          this.errorMsg = error[0].toUpperCase() + error.slice(1);
          console.error(this.errorMsg);
        });
      if (!rta) {
        this.error = true;
      }
    },
    getModeIndex(name) {
      switch (name) {
        case "vacation":
          return 1;
        case "party":
          return 2;
        case "default":
          return 0;
      }
    },
    updateDev(device) {
      this.temperature = device.state.temperature;
      this.freezer_temp = device.state.freezerTemperature;
      this.mode = this.getModeIndex(device.state.mode);
    },
    async getData() {
      let rta = await getDevice(this.device.id)
        .catch((error) => {
          this.errorMsg = error[0].toUpperCase() + error.slice(1);
          console.error(this.errorMsg);
        });
      if (rta) {
        console.log(rta.result);
        this.updateDev(rta.result);
      } else {
        this.error = true;
      }
    }
  },
  mounted() {
    this.getData();
    let timer = setInterval(() => this.getData(), 1000);
  }
})

Vue.component('panel-speaker', {
  props: {
    device: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      song: this.getSong(this.device),
      play: (this.device.state.status === "playing"),
      stopped: (this.device.state.status === "stopped"),
      volume: this.device.state.volume,
      genres: ['pop', 'rock', 'latina', 'dance', 'country', 'classical'],
      genre: this.device.state.genre
    }
  },
  watch: {
    play(newVal, oldVal) {
      if (newVal)
        this.sendAction("play", []);
      else if (!this.stopped) this.sendAction("pause", []);
    },
    stopped(newVal, oldVal) {
      if (newVal) {
        this.play = false;
        this.sendAction("stop", []);
      }
    },
    volume(newVal, oldVal) {
      this.sendAction("setVolume", [newVal]);
    },
    genre(newVal, oldVal) {
      this.sendAction("setGenre", [newVal]);
    }
  },
  template:
    `<v-container fluid>
      <v-list-item three-line>
        <v-list-item-content>
          <v-list-item-subtitle>{{ song.progress }} / {{ song.duration }}</v-list-item-subtitle>  
          <v-list-item-title>{{ song.title }}</v-list-item-title>
          <v-list-item-subtitle>{{ song.artist }} - {{ song.album }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-layout align-center wrap ma-3>
        <v-layout column>
          <v-btn icon @click="skipPrev()">
            <v-icon size="60">mdi-skip-previous-circle</v-icon>
          </v-btn>
        </v-layout>

        <v-layout column>
          <v-btn icon @click="play = !play">
            <v-icon v-show="!play" size="60">mdi-play-circle</v-icon>
            <v-icon v-show="play" size="60">mdi-pause-circle</v-icon>
          </v-btn>
        </v-layout>

        <v-layout column>
          <v-btn icon @click="skipNext()">
            <v-icon size="60">mdi-skip-next-circle</v-icon>
          </v-btn>
        </v-layout>

        <v-layout column align-end>
          <v-btn icon @click="stopped = true">
            <v-icon size="60">mdi-stop-circle</v-icon>
          </v-btn>
        </v-layout>
      </v-layout>

      <v-subheader>Volume</v-subheader>
      <v-slider v-model="volume" class="mt-4" prepend-icon="mdi-volume-medium" thumb-label="always" min="0" max="10" step="1"
        thumb-size="25" color="orange" track-color="black" thumb-color="orange darken-2"></v-slider>
      
      <v-select v-model="genre" :items="genres" class="text-capitalize" required ></v-select>
    </v-container>`,
  computed: {
    getTime() {
      return this.elapsed_time; // here to do conversion secs to something printable
    }
  },
  methods: {
    skipNext(){
      this.sendAction("nextSong", []);
    },
    skipPrev(){
      this.sendAction("previousSong", []);
    },
    getSong(device) {
      if (this.device.state.status === "stopped") return {title: "-",
                                                          artist: "-",
                                                          album: "-",
                                                          duration: "-",
                                                          progress: "-"};
      return device.state.song;
    },
    async sendAction(action, param) {
      let rta = await execAction(this.device.id, action, param)
        .catch((error) => {
          this.errorMsg = error[0].toUpperCase() + error.slice(1);
          console.error(this.errorMsg);
        });
      if (!rta) {
        this.error = true;
      }
    },
    updateDev(device) {
      this.song = this.getSong(device);
      this.play = (device.state.status === "playing");
      this.stopped = (device.state.status === "stopped");
      this.volume = device.state.volume;
      this.genre = device.state.genre;
    },
    async getData() {
      let rta = await getDevice(this.device.id)
        .catch((error) => {
          this.errorMsg = error[0].toUpperCase() + error.slice(1);
          console.error(this.errorMsg);
        });
      if (rta) {
        console.log(rta.result);
        this.updateDev(rta.result);
      } else {
        this.error = true;
      }
    }
  },
  mounted() {
    this.getData();
    let timer = setInterval(() => this.getData(), 1000);
  }
})

Vue.component('panel-door', {
  props: {
    device: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      closed: (this.device.state.status === "opened") ? 1 : 0,
      locked: (this.device.state.lock === "locked")
    }
  },
  watch: {
    closed(newVal, oldVal) {
      if (newVal === 0)
        this.sendAction("close", []);
      else {
        this.sendAction("open", []);
        this.locked = false;
      }
    },
    locked(newVal, oldVal) {
      if (newVal)
        this.sendAction("lock", []);
      else this.sendAction("unlock", []);
    }
  },
  template:
    `<v-container fluid>
      <v-layout align-center class="ma-5">
        <v-layout column>
          <v-btn-toggle v-model="closed" tile color="orange darken-2" group mandatory>
            <v-btn>Closed</v-btn>
            <v-btn>Open</v-btn>
          </v-btn-toggle>
        </v-layout>
        <v-layout column>
          <v-btn icon @click="lock()">
            <v-icon v-show="locked" size="40">mdi-lock</v-icon>
            <v-icon v-show="!locked" size="40">mdi-lock-open-outline</v-icon>
          </v-btn>
        </v-layout>
      </v-layout>
    </v-container>`,
  methods: {
    lock() {
      this.locked = !this.locked;
      if (this.locked) {
        this.closed = 0;
      }
    },
    async sendAction(action, param) {
      let rta = await execAction(this.device.id, action, param)
        .catch((error) => {
          this.errorMsg = error[0].toUpperCase() + error.slice(1);
          console.error(this.errorMsg);
        });
      if (!rta) {
        this.error = true;
      }
    },
    updateDev(device) {
      this.closed = (device.state.status === "opened") ? 1 : 0;
      this.locked = (device.state.lock === "locked");
    },
    async getData() {
      let rta = await getDevice(this.device.id)
        .catch((error) => {
          this.errorMsg = error[0].toUpperCase() + error.slice(1);
          console.error(this.errorMsg);
        });
      if (rta) {
        console.log(rta.result);
        this.updateDev(rta.result);
      } else {
        this.error = true;
      }
    }
  },
  mounted() {
    this.getData();
    let timer = setInterval(() => this.getData(), 1000);
  }
})

Vue.component('panel-window', {
  props: {
    device: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      closed: this.getClosedIndex(this.device.state.status),
      moving: this.getStatus(this.device.state.status),
      progress: this.device.state.level,
    }
  },
  watch: {
    closed(newVal, oldVal) {
      if (newVal === 0) {
        this.sendAction("close", []);
        this.closing = true;
      } else {
        this.sendAction("open", []);
        this.opening = true;
      }
    }
  },
  template:
    `<v-container fluid>
      <v-layout column align-center class="ma-5">
        <v-btn-toggle v-model="closed" tile color="orange darken-2" group mandatory>
            <v-btn :disabled="moving" >Closed</v-btn>
            <v-btn :disabled="moving" >Open</v-btn>
        </v-btn-toggle>
        <v-subheader v-show="progress > 0 && progress < 100" class="text-capitalize">{{device.state.status}}</v-subheader>
        <v-progress-linear v-show="progress > 0 && progress < 100" v-model="progress" color="orange"></v-progress-linear>
      </v-layout>
    </v-container>`,
  methods: {
    async sendAction(action, param) {
      let rta = await execAction(this.device.id, action, param)
        .catch((error) => {
          this.errorMsg = error[0].toUpperCase() + error.slice(1);
          console.error(this.errorMsg);
        });
      if (!rta) {
        this.error = true;
      }
    },
    getClosedIndex(status) {
      if (status === "closed" || status == "closing") return 0;
      return 1;
    },
    getStatus(status) {
      return (status === "opening" || status == "closing");
    },
    updateDev(device) {
      this.device.state.status = device.state.status;
      this.closed = this.getClosedIndex(device.state.status);
      this.moving = this.getStatus(device.state.status);
      this.progress = device.state.level;
    },
    async getData() {
      let rta = await getDevice(this.device.id)
        .catch((error) => {
          this.errorMsg = error[0].toUpperCase() + error.slice(1);
          console.error(this.errorMsg);
        });
      if (rta) {
        console.log(rta.result);
        this.updateDev(rta.result);
      } else {
        this.error = true;
      }
    }
  },
  mounted() {
    this.getData();
    let timer = setInterval(() => this.getData(), 1000);
  }
})

Vue.component('panel-airconditioner', {
  props: {
    device: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      state: (this.device.state.status === "on"),
      temperature: this.device.state.temperature,
      mode: this.getModeIndex(this.device.state.mode),
      fan_speed: this.getSpeedNumber(this.device.state.fanSpeed),
      auto_fan_speed: (this.device.state.fanSpeed === "auto"),
      vertical_wings: this.getSwingNumber(this.device.state.verticalSwing),
      auto_vertical_wings: (this.device.state.verticalSwing === "auto"),
      horizontal_wings: this.getSwingNumber(this.device.state.horizontalSwing),
      auto_horizontal_wings: (this.device.state.horizontalSwing === "auto"),
    }
  },
  watch: {
    state(newVal, oldVal) {
      if (newVal)
        this.sendAction("turnOn", []);
      else this.sendAction("turnOff", []);
    },
    temperature(newVal, oldVal) {
      this.sendAction("setTemperature", [newVal]);
    },
    mode(newVal, oldVal) {
      var aux = "heat";
      if (newVal === 0)
        aux = "cold";
      else if (newVal === 1)
        aux = "fan";
      this.sendAction("setMode", [aux]);
    },
    fan_speed(newVal, oldVal) {
      this.sendAction("setFanSpeed", [newVal.toString()]);
    },
    auto_fan_speed(newVal, oldVal) {
      if (newVal)
        this.sendAction("setFanSpeed", ["auto"]);
      else this.sendAction("setFanSpeed", [this.fan_speed.toString()]);

    },
    vertical_wings(newVal, oldVal) {
      this.sendAction("setVerticalSwing", [Math.trunc(newVal).toString()]);
    },
    auto_vertical_wings(newVal, oldVal) {
      if (newVal)
        this.sendAction("setVerticalSwing", ["auto"]);
      else this.sendAction("setVerticalSwing", [Math.trunc(this.vertical_wings).toString()]);
    },
    horizontal_wings(newVal, oldVal) {
      this.sendAction("setHorizontalSwing", [newVal.toString()]);
    },
    auto_horizontal_wings(newVal, oldVal) {
      if (newVal)
        this.sendAction("setHorizontalSwing", ["auto"]);
      else this.sendAction("setHorizontalSwing", [this.horizontal_wings.toString()]);
    }
  },
  template:
    `<v-container fluid>
      <v-layout align-center wrap>
        <v-layout column align-end mr-2>
          <h3>Off</h3>
        </v-layout>
        <v-layout column>
          <v-switch class="align-center justify-center" v-model="state" color="orange"></v-switch>
        </v-layout>
        <v-layout column>
          <h3>On</h3>
        </v-layout>
      </v-layout>
      <v-subheader>Temperature</v-subheader>
      <v-slider v-model="temperature" class="mt-4" step="1" ticks="always" tick-size="4" min="18" max="38"
          thumb-label="always" thumb-size="25" color="orange" track-color="black" thumb-color="orange darken-2"></v-slider>
    
      <v-subheader>Mode</v-subheader>
      <v-layout column align-center>
          <v-btn-toggle v-model="mode" tile color="orange darken-2" group mandatory>
              <v-btn>Cold</v-btn>
              <v-btn>Vent</v-btn>
              <v-btn>Heat</v-btn>
          </v-btn-toggle>
      </v-layout>

      <v-subheader>Fan Speed</v-subheader>
      <v-row>
        <v-col cols="8">
          <v-slider v-model="fan_speed" class="mt-4" step="25" ticks="always" tick-size="4" min="25" max="100"
          thumb-label="always" thumb-size="25" color="orange" track-color="black"
          thumb-color="orange darken-2" :disabled="auto_fan_speed"></v-slider>
        </v-col>
        <v-col>
          <v-checkbox label="Auto" color="orange darken-2" v-model="auto_fan_speed"></v-checkbox>
        </v-col>
      </v-row>
      <v-subheader>Vertical Wings</v-subheader>
      <v-row>
        <v-col cols="8">
          <v-slider v-model="vertical_wings" class="mt-4" step="22.5" ticks="always" tick-size="4" min="22.5" max="90"
          thumb-label="always" thumb-size="25" color="orange" track-color="black"
          thumb-color="orange darken-2" :disabled="auto_vertical_wings"></v-slider>
        </v-col>
        <v-col>
          <v-checkbox label="Auto" color="orange darken-2" v-model="auto_vertical_wings"></v-checkbox>
        </v-col>
      </v-row>
      <v-subheader>Horizontal Wings</v-subheader>
      <v-row>
        <v-col cols="8">
          <v-slider v-model="horizontal_wings" class="mt-4" step="45" ticks="always" tick-size="4" min="-90" max="90"
          thumb-label="always" thumb-size="25" color="orange" track-color="black"
          thumb-color="orange darken-2" :disabled="auto_horizontal_wings"></v-slider>
        </v-col>
        <v-col>
          <v-checkbox label="Auto" color="orange darken-2" v-model="auto_horizontal_wings"></v-checkbox>
        </v-col>
      </v-row>
    </v-container>`,
  methods: {
    getSpeedNumber(str) {
      if (str === "auto") return 50;
      return parseInt(str, 10);
    },
    getSwingNumber(str) {
      if (str === "auto") return 45;
      return parseInt(str, 10);
    },
    getModeIndex(mode) {
      switch (mode) {
        case "cool":
          return 0;
        case "fan":
          return 1;
        case "heat":
          return 2;
      }
    },
    async sendAction(action, param) {
      let rta = await execAction(this.device.id, action, param)
        .catch((error) => {
          this.errorMsg = error[0].toUpperCase() + error.slice(1);
          console.error(this.errorMsg);
        });
      if (!rta) {
        this.error = true;
      }
    },
    updateDev(device) {
      this.state = (device.state.status === "on");
      this.temperature = device.state.temperature;
      this.mode = this.getModeIndex(device.state.mode);
      this.fan_speed = this.getSpeedNumber(device.state.fanSpeed);
      this.auto_fan_speed = (device.state.fanSpeed === "auto");
      this.vertical_wings = this.getSwingNumber(device.state.verticalSwing);
      this.auto_vertical_wings = (device.state.verticalSwing === "auto");
      this.horizontal_wings = this.getSwingNumber(device.state.horizontalSwing);
      this.auto_horizontal_wings = (device.state.horizontalSwing === "auto");
    },
    async getData() {
      let rta = await getDevice(this.device.id)
        .catch((error) => {
          this.errorMsg = error[0].toUpperCase() + error.slice(1);
          console.error(this.errorMsg);
        });
      if (rta) {
        console.log(rta.result);
        this.updateDev(rta.result);
      } else {
        this.error = true;
      }
    }
  },
  mounted() {
    this.getData();
    let timer = setInterval(() => this.getData(), 1000);
  }
})
