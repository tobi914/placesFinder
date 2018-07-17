/* Google autocomplete box which can be used if geolocation is not working or just for fun of course. */

<template>
    <div class="autoSearchbox">
        <input type="text" id="searchbox" @click="clearBox" v-model="address">
    </div>
</template>

<script>
    export default {
        name: "autoSearchbox",
        data: function() {
            return {
                address: '',
                position: null,
                searchBox: null
            }
        },
        methods:{
            getLocation: function(){
                let places = this.searchBox.getPlaces();
                if(places.length == 0){
                    return;
                }
                this.position = places[0].geometry.location;
                this.$emit('received', this.position);
            },
            clearBox: function(){
                this.address = '';
            }
        },
        mounted: function(){
          this.searchBox = new google.maps.places.SearchBox(document.getElementById('searchbox'));
          this.searchBox.addListener('places_changed', this.getLocation);
        }
    }
</script>

<style scoped>
    input{
        width: 100%;
        height: 100%;
        font-size: 15px;
        text-align: left;
    }
</style>