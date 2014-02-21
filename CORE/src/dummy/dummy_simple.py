from socketIO_client import SocketIO
import simplejson as json
import sys
import time
import string
import random

config = "../config.json"
cfg = json.load(open(config))

ID = "dummyMod"
SLOTS = ["GPS_DATA"]
SIGNALS = ["aaa"]
HOST = cfg["globals"]["socketio"]["host"]
PORT = cfg["globals"]["socketio"]["port"]

def create_msg(body):
    return {"header":{
        "msg":{
            "id": ''.join(random.choice(string.ascii_lowercase + string.digits) for x in range(6)) ,
            "emitter":ID,
            "timestamp": int(time.time())
            }
        }, "body":  body
    }

def on_connect(*args):
  print 'connect'
  moduleDesc = {'id':ID,'slots':SLOTS,'signals':SIGNALS}
  socketIO.emit('link', moduleDesc)
  
def on_aaa_response(*args):
    print 'on_aaa_response', args

def on_GPS_DATA(*args):
    print 'GPS_DATA', args
    socketIO.emit('aaa',create_msg({"value":"Hallo ich bin Signal von " + ID}) ), on_aaa_response
    socketIO.wait_for_callbacks(seconds=1)
  
socketIO = SocketIO(HOST,PORT)
socketIO.on('connect', on_connect)
[socketIO.on(i,getattr(sys.modules[__name__],"on_"+i)) for i in SLOTS] 
socketIO.wait()
