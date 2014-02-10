from socketIO_client import SocketIO, BaseNamespace
import sys, getopt
import argparse

parser = argparse.ArgumentParser(description='a Module')

parser.add_argument('--id', default='dummyPYModule', help='the name of the module')
parser.add_argument('--host', default='localhost', help='the host')
parser.add_argument('--port', type=int, default=8080, help='the port')

parser.add_argument('--logLevel', type=int, default=2, help='debug')
parser.add_argument('--sleep', type=int, default=1, help='time.sleep(x)')
parser.add_argument('--wait', type=int, default=1, help='socketIO.wait(x)')

config = parser.parse_args()


slots = ["dummyPYSlot","GPS_DATA"]
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
  #data = args[0]
  #data['count']+=1
  #data['date']['arrived'] = strftime("%Y-%m-%d %H:%M:%S", gmtime())
  socketIO.emit('dummyPYSignal', 1)

  
def on_DATA_GPS(*args):
  print 'DATA_GPS'


socketIO = SocketIO(config.host, config.port)
socketIO.on('connect', on_connect)
socketIO.on('dummyPYSlot', on_dummyPYSlot)
socketIO.on('GPS_DATA', on_DATA_GPS)


socketIO.wait()



