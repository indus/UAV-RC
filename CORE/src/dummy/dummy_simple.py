from socketIO_client import SocketIO
import sys

id = "dummyMod"
slots = ["GPS_DATA"]
signals = ["aaa"]
#host = "192.168.1.35"
#port = 8080
host = "localhost"
port = 8081


def on_connect(*args):
  print 'connect'
  moduleDesc = {'id':id,'slots':slots,'signals':signals}
  socketIO.emit('link', moduleDesc)
  
def on_aaa_response(*args):
    print 'on_aaa_response', args
def on_GPS_DATA(*args):

    print 'GPS_DATA', args
    socketIO.emit('aaa',{'xxx':"Hallo ich bin Signal AAA von Dummy2"}, on_aaa_response )
    socketIO.wait_for_callbacks(seconds=1)
  
socketIO = SocketIO(host,port)
socketIO.on('connect', on_connect)
[socketIO.on(i,getattr(sys.modules[__name__],"on_"+i)) for i in slots] 
socketIO.wait()
