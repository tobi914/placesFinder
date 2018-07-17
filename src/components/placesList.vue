/* Displays a sortable List of search result, calculates distance between user location and the
    places looked for. Sorts and resizes the list and emits it back to gMap.
    Clicking on the table headers sorts the list accordingly, clicking on a table row brings
    up a modal showing a google static map with the user location and the entry location*/


<template>
    <div class="tableContainer">
        <table class="table">
            <thead>
                <tr>
                    <th class="namehead" @click="sortList('names')">Name</th>
                    <th class="disthead" @click="sortList('distance')">Distance</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in listItems" :key="index" @click="getMinimapUrl(index)">
                     <td class="namecell">{{item.name}}</td>
                     <td class =distcell>{{item.distance}} m</td>
                 </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
    export default {
        props:{
            places:{
                default: [],
                type: Array
            },
            location: {
                default: null,
                type: Object
            },
            length:{
                default: -1,
                type: Number
            }
        },
        name: "placesList",
        data: function(){
            return{
                listItems: [],
                minimapUrl: ''
            }
        },

        // Checks if the users length input is valid, if not, makes it valid

        computed:{
            cLength: function(){
                if(this.length < 0 || this.length > this.places.length){
                    return this.places.length;
                }
                else{
                    return this.length;
                }
            }
        },

        // Create and emit new list every time the places prop has changed

        watch:{
            places: function(){
                this.updateListItems();
            }
        },
        methods:{

            // Calculate distance between 2 points in meters

            rad: function(x){
                return x * Math.PI / 180;
            },
            getDistance: function(point){
                let R = 6378137;
                let dLat = this.rad(point.lat() - this.location.lat());
                let dLong = this.rad(point.lng() - this.location.lng());
                let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(this.rad(this.location.lat())) * Math.cos(this.rad(point.lat())) *
                    Math.sin(dLong / 2) * Math.sin(dLong / 2);
                let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                let d = R * c;
                return Number(d.toFixed(0));
            },

            // Creates a sorted array with all the data needed further on and resizes it

            updateListItems: function(){
                this.listItems = [];
                for(let i = 0; i < this.cLength; ++i){
                    this.listItems.push({
                        name: this.places[i].name,
                        location: this.places[i].geometry.location,
                        distance: this.getDistance(this.places[i].geometry.location),
                        image: this.places[i].photos,
                        address: this.places[i].vicinity
                    });
                }
                this.listItems.sort(this.compareDist);
                this.listItems = this.listItems.slice(0, Number(this.length));
                this.$emit('finished', this.listItems);
            },

            // Sorts the list ascending after the given parameter

            sortList: function(type){
                if(type == 'distance'){
                    this.listItems.sort(this.compareDist);
                }
                else if(type == 'names'){
                    this.listItems.sort(this.compareName);
                }
            },

            // Compare functions for array.sort()

            compareDist: function(a, b){
                if(a.distance < b.distance){
                    return -1;
                }
                else if(a.distance > b.distance){
                    return 1;
                }
            },
            compareName: function(a, b){
                if(a.name < b.name){
                    return -1;
                }
                else if(a.name > b.name){
                    return 1;
                }
            },

            // Puts together a google static map URL and emits it to gMap

            getMinimapUrl: function(index){
                this.minimapUrl = 'https://maps.googleapis.com/maps/api/staticmap?' +
                    'size=600x400&' +
                    'markers=anchor:bottom|' +
                    'label:B|' +
                    this.listItems[index].location.lat() + ',' +
                    this.listItems[index].location.lng() + '&' +
                    'markers=anchor:bottom|' +
                    'color:blue|' +
                    'label:A|' +
                    this.location.lat() + ',' +
                    this.location.lng() + '&' +
                    'key=AIzaSyBP-BLiqXxf5pnZdnZYz9diITQfKkvoqWY';
                this.$emit('urlCreated', this.minimapUrl);
            }
        },
    }
</script>

<style scoped>

    th, td {
        padding: 20px;
        text-align: left;
        border-bottom: 1px solid #ddd;
    }
    th{
        height: 70px;
        background-color: #4CAF50;
        color: white;
        top: 0;
        position: sticky;
        border: 2px solid #4CAF50;
        -webkit-transition-duration: 0.6s;
    }
    th:hover{
        background-color: #00cc00;
    }
    tr{
        -webkit-transition-duration: 0.6s;
    }
    tr:hover{
        background-color: #99ff99;
    }
    .tableContainer{
        overflow-x: auto;
    }
    .distcell{
        text-align: right;
    }
    .namehead{
        width: 70%;
    }
    .disthead{
        width: 30%;
    }
    .hint{
        font-size: 40px;
        text-align: center;
        top: 50%;
    }
    table{
        table-layout: fixed;
        width: 100%;
    }

</style>