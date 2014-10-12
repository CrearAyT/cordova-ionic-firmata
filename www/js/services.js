'use strict';

var hex2cmd_table = {
    0x01: 'ONEWIRE_RESET_REQUEST_BIT',
    0x08: 'ONEWIRE_READ_REQUEST_BIT',
    0x10: 'ONEWIRE_DELAY_REQUEST_BIT',
    0x20: 'ONEWIRE_WRITE_REQUEST_BIT',
    0x40: 'ONEWIRE_SEARCH_REQUEST',
    0x74: 'PULSE_IN',
    0x3c: 'ONEWIRE_WITHDATA_REQUEST_BITS',
    0xc0: 'REPORT_ANALOG',
    0x41: 'ONEWIRE_CONFIG_REQUEST',
    0x42: 'ONEWIRE_SEARCH_REPLY',
    0x43: 'ONEWIRE_READ_REPLY',
    0x44: 'ONEWIRE_SEARCH_ALARMS_REQUEST',
    0x45: 'ONEWIRE_SEARCH_ALARMS_REPLY',
    0xf7: 'END_SYSEX',
    0xd0: 'REPORT_DIGITAL',
    0xf9: 'REPORT_VERSION',
    0xe0: 'ANALOG_MESSAGE',
    0x90: 'DIGITAL_MESSAGE',
    0x69: 'ANALOG_MAPPING_QUERY',
    0x6a: 'ANALOG_MAPPING_RESPONSE',
    0x6b: 'CAPABILITY_QUERY',
    0x6c: 'CAPABILITY_RESPONSE',
    0x6d: 'PIN_STATE_QUERY',
    0x6e: 'PIN_STATE_RESPONSE',
    0x6f: 'EXTENDED_ANALOG',
    0xf0: 'START_SYSEX',
    0x71: 'STRING_DATA',
    0x72: 'STEPPER',
    0x73: 'PULSE_OUT',
    0xf4: 'PIN_MODE',
    0x76: 'I2C_REQUEST',
    0x77: 'I2C_REPLY',
    0x78: 'I2C_CONFIG',
    0x79: 'QUERY_FIRMWARE',
    0x7a: 'SAMPLING_INTERVAL',
    0xff: 'SYSTEM_RESET',
};

function hex2cmd(val) {
    if (val in hex2cmd_table) {
        return hex2cmd_table[val];
    } else {
        return '0x' + val.toString(16);
    }
};

function cmdbuf2str(buf) {
    var tmp = [];
    if (buf instanceof ArrayBuffer) {
        buf = new Uint8Array(buf);
    }

    if (buf.charCodeAt != undefined) {
        for (var idx=0; idx < buf.length ; idx++) {
          tmp[idx] = ' ' + hex2cmd(buf.charCodeAt(idx));
        }
    } else {
        for (var idx=0; idx < buf.length ; idx++) {
          tmp[idx] = ' ' + hex2cmd(buf[idx]);
        }
    }

    return ''.concat(tmp);
};

angular.module('starter.services', [])

.service('FirmatAngular', function($rootScope, $interval, $log, $q) {

  var _Firmata = {};

  _Firmata.port = null;
  _Firmata.debug = false;

  var serialWrapper = {
    read: function() {},
    write: function(data) {
      var cmd = data;
      if (data instanceof ArrayBuffer) {
          data = new Uint8Array(data);
          cmd = String.fromCharCode.apply(null, data)
      } else if (data instanceof Array || data instanceof Uint8Array) {
          cmd = String.fromCharCode.apply(null, data)
      } else {
      }
      if (_Firmata.debug) {
        $log.debug('write(): ', cmdbuf2str(cmd));
      }

      if (_Firmata.port) {
        if (_Firmata.port.writeRaw) {
          var cmd = [];
          for(var i=0; i < data.length; i++) {
            cmd.push(data[i]);
          }
          _Firmata.port.writeRaw(cmd);
        } else {
          _Firmata.port.write(cmd);
        }
      }

/*
      if (_Firmata.port) {
        _Firmata.port.write(cmd,
        function() {
            //$log.debug('write() ok: ', arguments);
        },
        function() {
            //$log.debug('write() EE: ', arguments);
        }
        );
      }
*/
    }
  };

  _Firmata.setPort = function(port) {
    _Firmata.port = port;
  };

  _Firmata.processData = function(data) {
    if (_Firmata.debug) {
      $log.debug('read():  ', cmdbuf2str(data));
    }

    if (_Firmata.Board) {
        _Firmata.Board.processData(data);
    }
  };

  _Firmata.reset = function() {
    if (!_Firmata.Board) {
      return;
    }

    _Firmata.Board.pins.length = 0;
    _Firmata.Board.analogPins.length = 0;
/*
    for (var i = 0 ; i <= 21 ; i++) {
      _Firmata.Board.pins.push({value:0});
    }
    for (var i = 14 ; i <= 21 ; i++) {
      _Firmata.Board.analogPins.push(i);
    }
*/
  }

  var Board = new Firmata.Board(serialWrapper);
  _Firmata.Board = Board;

  var _apply = _.debounce(function(){
    $rootScope.$apply();
  }, 20);
  Board.on('digital-read', _apply);
  Board.on('analog-read', _apply);
  Board.on('reportversion', _apply);
  Board.on('queryfirmware', _apply);
  Board.on('capability-query', _apply);
  Board.on('analog-mapping-query', _apply);
  Board.on('string', _apply);

  return _Firmata;
});
