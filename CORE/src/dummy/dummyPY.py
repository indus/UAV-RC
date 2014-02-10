from socketIO_client import SocketIO, BaseNamespace
import sys, getopt
import argparse

parser = argparse.ArgumentParser(description='a Module')

parser.add_argument('--id', default='dummyPYModule', help='the name of the module')
parser.add_argument('--host', default='127.0.0.1', help='the host-address of the Socket.IO Server')
parser.add_argument('--port', type=int, default=8081, help='the TCP/IP listen port of the Socket.IO Server')

parser.add_argument('--logLevel', type=int, default=2, help='debug')

config = parser.parse_args()


slots = ["dummyPYSlot", "GPS_DATA"]
signals = ["dummyPYSignal"]

def log(arg):
  if config.logLevel > 0:
    print arg
    if config.logLevel > 1:
      sys.stdout.flush()
      if config.logLevel > 2:
        socketIO.emit('LOG', arg)

def on_connect(*args):
  print 'connect'
  sys.stdout.flush()
  moduleDesc = {'id':config.id,'slots':slots,'signals':signals}
  socketIO.emit('link', moduleDesc)

from time import gmtime, strftime
def on_dummyPYSlot(*args):
  print 'dummyPYSlot'
  data = args[0]
  data['count']+=1
  data['date']['arrived'] = strftime("%Y-%m-%d %H:%M:%S", gmtime())
  socketIO.emit('dummyPYSignal', data)

def on_dummyPYSignal(*args):
  print 'dummyPYSIGNAL'
  
def on_GPS_DATA(*args):
  print "HALLO"
  print "args: ", args;
  

socketIO = SocketIO(config.host, config.port)
socketIO.on('connect', on_connect)
#socketIO.on('dummyPYSlot', on_dummyPYSlot)

socketIO.on('GPS_DATA', on_GPS_DATA)
socketIO.emit('dummyPYSignal',"Hallo!!!")
#socketIO.on('GPS_DATA', on_DATA_GPS)
socketIO.wait()
    