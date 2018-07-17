/* Contains subcomponents and manipulates the map */


<template>
    <div class="gMap">
        <div class="map" :id="mapName"></div>
        <autoSearchbox class="searchbox" @received="newRequest"></autoSearchbox>
        <placesList class="list" @finished="getSortedList" @urlCreated="openModal" :length="Number(listLength)" :mapUrl="minimapUrl" :location="center" :places="places"></placesList>
        <mapModal :mapUrl="minimapUrl" v-if="showModal" @close="showModal = false"></mapModal>
        <div class="settings">
            Show the nearest <input type="number" class="itemcount" v-model="listLength" @/>
            <select class="choosetype" v-model="request.type[0]">
                <option value="" hidden>Choose</option>
                <option v-for="entry in requestOptions" :value="entry.value">{{entry.text}}</option>
            </select>
            <div class="refresh">
                <button @click="newRequest('')">Refresh</button>
            </div>
        </div>
    </div>
</template>


<script>

    import placesList from './placesList.vue';
    import autoSearchbox from './autoSearchbox.vue';
    import mapModal from './mapModal.vue';

    export default {
        name: 'gMap',
        components:{
            'placesList': placesList,
            'autoSearchbox': autoSearchbox,
            'mapModal': mapModal
        },
        props: {
            name: {
                default: 'standard',
                type: String
            },
            zoom: {
                default: 15,
                type: Number
            }
        },
        data: function () {
            return {
                mapName: this.name + '-map',
                mapZoom: this.zoom,
                map: null,
                infowindow: null,
                center: null,
                service: null,
                listLength: 10,
                request:{
                    location: null,
                    radius: 1000,
                    type: ['']
                },
                requestOptions:[{
                    value: 'atm',
                    text: 'ATMs'
                },{
                    value: 'restaurant',
                    text: 'Restaurants'
                },{
                    value: 'bar',
                    text: 'Bars'
                },{
                    value: 'doctor',
                    text: 'Doctors'
                },{
                    value: 'pharmacy',
                    text: 'Pharmacies'
                },{
                    value: 'cafe',
                    text: 'Cafes'
                },{
                    value: 'convenience_store',
                    text: 'Convenience Stores'
                }],
                markers: [],
                places: [],
                sortedList: [],
                markerOptions:{
                    map: null,
                    position: null,
                    title: '',
                    icon: null
                },
                markerSize: null,
                showModal: false,
                minimapUrl: '',
            }
        },
        methods: {

            // Get GPS data from the device

            geolocate: function () {

                return new Promise((res, rej) => {
                    navigator.geolocation.getCurrentPosition(res, rej);
                });
            },
            callback: function(results, status){
                if(status == google.maps.places.PlacesServiceStatus.OK){
                    for(var i = 0; i < results.length; ++i){
                        this.places.push(results[i]);
                    }
                }
            },

            // Create markers on the map and add a listener which opens the infowindow on click

            createMarkers: function(){
                let marker;
                let self = this;
                for(let i = 0; i < this.sortedList.length; ++i)
                {
                    this.markerOptions.position = this.sortedList[i].location;
                    marker = new google.maps.Marker(this.markerOptions);
                    marker.addListener('click', function(){
                        if(!self.sortedList[i].image)
                        {
                            self.infowindow.setContent(
                                '<p>' + self.sortedList[i].name + '</p>' +
                                '<p>' + self.sortedList[i].address + '</p>'
                            );
                        }
                        else
                        {
                            self.infowindow.setContent(
                                '<div style="width: 320px; padding-bottom: 10px">' +
                                '<div style="">' +
                                '<p>' + self.sortedList[i].name + '</p>' +
                                '<p>' + self.sortedList[i].address + '</p>' +
                                '</div>' +
                                '<img style="border-radius: 10px; box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);" ' +
                                'src=' + self.sortedList[i].image[0].getUrl({'maxWidth': 300, 'maxHeight': 200}) + '"/>' +
                                '</div>');
                        }
                        self.infowindow.open(self.map, this);
                    });
                    this.markers.push(marker);
                }
            },

            // Creates a maker for the users geolocated or entered position

            createOwnMarker: function(){

                this.updateMarkerOptions();
                this.markerOptions.icon ={
                    url: require('../assets/markers/ownPositionBlue.png'),
                    scaledSize: this.markerSize
                };
                this.markerOptions.position = this.center;
                this.markers.push(new google.maps.Marker(this.markerOptions));
            },
            clearMarkers: function(){
                for(let i = 0; i < this.markers.length; ++i){
                    this.markers[i].setMap(null);
                }
                this.markers = [];
            },

            // Puts together a new nearby-search request and executes it

            newRequest: function(newCenter){
                if(newCenter !='') {
                    this.request.location = newCenter;
                    this.center = newCenter;
                    this.map.setCenter(newCenter);
                }
                if(this.request.type[0] == '')
                {
                    return;
                }
                this.clearMarkers();
                this.places =[];
                this.createOwnMarker();
                this.updateMarkerOptions('created via autocompletebox');
                this.service.nearbySearch(this.request, this.callback);
            },

            // Initializes most of the variables for this component

            mapSetup: function() {
                let element = document.getElementById(this.mapName);
                let options = {
                    zoom: this.mapZoom,
                    center: this.center
                };
                this.map = new google.maps.Map(element, options);
                this.markerSize = new google.maps.Size(50, 50);
                this.markerOptions.map = this.map;
                this.service = new google.maps.places.PlacesService(this.map);
                this.request.location = this.center;
                this.infowindow = new google.maps.InfoWindow();
            },

            // Loads custom marker icons and resizes them

            updateMarkerOptions: function(){
                if(this.request.type[0] =='atm') {
                    this.markerOptions.icon = {
                        url: require('../assets/markers/atmMarkerYellow.png'),
                        scaledSize: this.markerSize
                    }
                }
                else if(this.request.type[0] == 'doctor') {
                    this.markerOptions.icon = {
                        url: require('../assets/markers/docMarkerPurple.png'),
                        scaledSize: this.markerSize
                    }
                }
                else if(this.request.type[0] == 'restaurant') {
                    this.markerOptions.icon = {
                        url: require('../assets/markers/restaurantMarkerRed.png'),
                        scaledSize: this.markerSize
                    }
                }
                else if(this.request.type[0] == 'pharmacy') {
                    this.markerOptions.icon = {
                        url: require('../assets/markers/pharmacyMarkerRed.png'),
                        scaledSize: this.markerSize
                    }
                }
                else if(this.request.type[0] == 'convenience_store') {
                    this.markerOptions.icon = {
                        url: require('../assets/markers/storeMarkerYellow.png'),
                        scaledSize: this.markerSize
                    }
                }
                else if(this.request.type[0] == 'cafe') {
                    this.markerOptions.icon = {
                        url: require('../assets/markers/cafeMarkerBlack.png'),
                        scaledSize: this.markerSize
                    }
                }
                else if(this.request.type[0] == 'bar') {
                    this.markerOptions.icon = {
                        url: require('../assets/markers/barMarkerGrey.png'),
                        scaledSize: this.markerSize
                    }
                }
            },

            // Controls if the modal is shown or not

            openModal: function(url){
                this.minimapUrl = url;
                this.showModal = true;
            },

            // Stores the list emitted from placesList

            getSortedList: function(sortedList){
                this.sortedList = sortedList;
                this.createMarkers();
            },
        },
        mounted: function(){
            this.geolocate().then((position) => {
                this.center = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                this.mapSetup();
            }).catch((error) => {
                console.log(error);
                alert('Geologaction not available on this device, please use manual search.');
                this.center = new google.maps.LatLng(47.259659, 11.400375);
                this.mapSetup();
            });
        }
    }


</script>

<style scoped>
    .gMap {
        width: 100%;
        height: 100%;
    }
    .map{
        width: 60%;
        height: 80%;
        background-color: #f5f5f5;
        float: left;
    }
    .searchbox{
        width: 40%;
        height: 3%;
        border-left-style: solid;
        border-left-color: #ddd;
        float:right;
        -webkit-box-sizing: border-box;
    }
    .list{
        float: right;
        width: 40%;
        height: 97%;
        background-color: #f5f5f5;
        border-left-color: #ddd;
        border-left-style: solid;
        -webkit-box-sizing: border-box;
    }
    .settings{
        padding-top: 15px;
        text-align: center;
        background-color: #f5f5f5;
        float: left;
        height: 20%;
        width: 60%;
        border-top-color: #ddd;
        border-top-style: solid;
        -webkit-box-sizing: border-box;
    }
    .itemcount {
        width: 30px;
        margin: 0;
    }
    input[type=number]::-webkit-inner-spin-button,
    input[type=number]::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
    .refresh{
        text-align: center;
        padding-top: 10px;
    }
    .refresh button{
        font-size: 40px;
        width: 90%;
        height: 70%;
        border-radius: 15px;
        background-color: #f5f5f5;
        box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19);
        -webkit-transition-duration: 0.4s;
    }
    .refresh button:hover{
        background-color: #4CAF50; /* Green */
        color: white;
    }
    .refresh button:focus{
        outline: 0;
    }
</style>