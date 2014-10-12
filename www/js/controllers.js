angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $ionicLoading, $timeout, $log, $q, FirmatAngular) {

  window.F = FirmatAngular;

  $scope.bluetoothDevices = [];

  function reloadBTDevices() {
    bluetoothSerial.list(function(devices) {
      $scope.bluetoothDevices = devices;
      $scope.$apply();
    });
  };

  if (ionic.Platform.isAndroid()) {
    setInterval(reloadBTDevices, 2000);
  } else {
    $scope.bluetoothDevices.push({
      name: "dummy BT device",
      address: "20:14:04:09:17:25",
      id: "20:14:04:09:17:25",
      "class": 7936,
    });
  }

  $scope.conectarBluetooth = function(options) {
    var options = options || {debug: false, firmata: true};

    FirmatAngular.debug = options.debug;
    FirmatAngular.setPort(null);

    if (!options.device) {
      return;
    }

    var device = options.device;

    bluetoothSerial.disconnect();
    $ionicLoading.show({
      template: 'Conectando a ' + device.name + ' ...',
    });

    FirmatAngular.reset();

    bluetoothSerial.connect(device.address,
      function() {
        $log.debug('bluetooth connect OK   : ', device.name, ' ', arguments);
        $ionicLoading.hide();
        if (options.firmata) {
          FirmatAngular.setPort(bluetoothSerial);
        } else {
          FirmatAngular.setPort(null);
        }

        FirmatAngular.Board.init();

        bluetoothSerial.rawSubscribe(
          function(data) {
                var buf = new Uint8Array(data);
                if (buf.length) {
                  FirmatAngular.processData(buf);
                }
          }
        );
      },

      function(err) {
        FirmatAngular.reset();
        $log.debug('bluetooth connect error: ', err);
        $ionicLoading.show({
          template: 'Bluetooth error: ' + err,
          duration: 1500,
        });
      }
    );
  };

  $scope.conectarCableado = function(options) {
    var options = options || {debug: false, firmata: true};

    FirmatAngular.debug = options.debug;
    FirmatAngular.setPort(null);

    serial.requestPermission(
    function () {
      $log.debug('requestPermission() ok');
      var opts = {
        baudRate: 57600,
      };

      serial.open(opts,
      function () {
        $log.debug('open() ok');

        serial.registerReadCallback(
        function success(data){
          var view = new Uint8Array(data);
          //console.log(String.fromCharCode.apply(null, view));
          FirmatAngular.processData(view);
        },
        function error(){
            new Error("Failed to register read callback");
        });

        if (options.firmata) {
          FirmatAngular.setPort(serial);
        } else {
          FirmatAngular.setPort(null);
        }
      },
      function () {
        $log.debug('open() error');
      });
    },

    function () {
      $log.debug('requestPermission() error');
    });
  };

  $scope.FirmatAngular = FirmatAngular;
  $scope.Firmata = Firmata;

  $scope.MODE_NAMES = _.invert(Firmata.MODES);
  $scope.MODE_NAMES[undefined] = "UNKOWN";

  $scope.toggleDebug = function(debug) {
    if (debug != undefined) {
      FirmatAngular.debug = debug;
    } else {
      FirmatAngular.debug = !FirmatAngular.debug;
    }
  };

  $scope.fakeInit = function() {
    FirmatAngular.Board.fakeInit();
  };
})

.controller('MainCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];

  $scope.valor = 5;
})

;
