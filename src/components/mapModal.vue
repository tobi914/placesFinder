/* A modal which contains the google static map */


<template>
  <transition name="modal">
    <div class="modal-mask" @click="$emit('close')">
      <div class="modal-wrapper">
          <div class="modal-header">
            <div class="modal-container">
                <h3>A = Your location</h3>
                <h3>B = Destination</h3>
              <div class="modal-body">
                  <img :src="url"></div>
              </div>
            </div>
      </div>
    </div>
  </transition>
</template>

<script>

    export default{
        name: 'mapModal',
        props:{
            mapUrl:{
                default: '',
                type: String
            }
        },
        data: function(){
            return {
                url: this.mapUrl
            }
        }
    }

</script>

<style>
    .modal-mask {
        position: fixed;
        z-index: 9998;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, .5);
        display: table;
        transition: opacity .3s ease;
    }

    .modal-wrapper {
        display: table-cell;
        vertical-align: middle;
    }

    .modal-container {
        width: 650px;
        height: 510px;
        margin: 0px auto;
        border-radius: 30px;
        background-color: #262626;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0);
        transition: all .3s ease;
        font-family: Helvetica, Arial, sans-serif;
    }

    .modal-header h3 {
        margin-top: 0;
        padding-top: 10px;
        margin-bottom: 5px;
        color: whitesmoke;
    }

    .modal-body {
        margin: 20px 0;
    }
    .modal-body img{
        border-radius: 20px;
    }

    .modal-enter {
        opacity: 0;
    }

    .modal-leave-active {
        opacity: 0;
    }

    .modal-enter .modal-container,
    .modal-leave-active .modal-container {
        -webkit-transform: scale(1.1);
        transform: scale(1.1);
    }
</style>