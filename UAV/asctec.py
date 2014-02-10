from socketIO_client import SocketIO
import simplejson as json
import d2xx
import traceback
import serial
import threading

id = "uav-asctec"
slots = ["CAMERA_PITCH_ANGLE_SET","CAMERA_PITCH_ANGLE_GET","GPS_DATA","UAV_CONNECT","UAV_DISCONNECT"]
signals = ["CAMERA_PITCH_ANGLE"]
config = "../config.json"
cfg = json.load(open(config))
host = cfg["globals"]["socketio"]["host"]
port = cfg["globals"]["socketio"]["port"]
comport = cfg["modules"]["uav-asctec"]["comport"]
baudrate = cfg["modules"]["uav-asctec"]["baudrate"]
databits = cfg["modules"]["uav-asctec"]["databits"]
stopbits = cfg["modules"]["uav-asctec"]["stopbits"]
parity = cfg["modules"]["uav-asctec"]["parity"]


class Asctec(object): 

    def __init__(self):
        self.connected = False
        self.pitch_angle = 90
        self.socketIO = SocketIO(host, port)
        self.socketIO.on('connect', self.on_socketio_connect)
        [self.socketIO.on(i,getattr(self, "on_"+i)) for i in slots] 
        self.socketIO.wait()
        
    def on_socketio_connect(self,*args):
        print 'socketio connect'
        moduleDesc = {'id':id,'slots':slots,'signals':signals}
        self.socketIO.emit('link', moduleDesc)
        #self.on_UAV_CONNECT()
        
        
    def on_UAV_CONNECT(self,args=None):
        """
        Tries to establish a connection to the remote control.
        """
        if (self.connected==True):
            print "ist schon verbunden gewesen"
            return
        self.connected = True
        self.connectionerror = False
        print "uav connect test"
        try:
            self.ser = serial.Serial(port='COM39',
                baudrate="57600",
                parity="N",
                stopbits=1,
                bytesize=8)  
            self.ser.write("hello\r\n")      # write a string
            
        except:
            traceback.print_exc()
        self.receiver = threading.Thread(target=self.read_from_port)
        self.receiver.start()
        if self.connected:
            self.socketIO.emit('UAV_CONNECTED', True)
        else:
            self.socketIO.emit('UAV_CONNECTED', False)
        
    def on_UAV_DISCONNECT(self,args=None):
        """
        Disconnects from remote control.
        """
        try:
            #self.receiver.start()
            self.connected = False
            self.ser.close()
            print "Connection closed!"
        except :
            traceback.print_exc()
            print traceback.format_exc()
        
    def on_CAMERA_PITCH_ANGLE_SET(self,args):
        self.pitch_angle = args['pitchangle']
        self.on_CAMERA_PITCH_ANGLE_GET()

    def on_CAMERA_PITCH_ANGLE_GET(self,args=None):
        self.socketIO.emit('CAMERA_PITCH_ANGLE', {"pitchangle":self.pitch_angle})

    def on_GPS_DATA(self,args):
        print 'got GPS_DATA'

    def handle_data(self,data):
        print(data)

    def read_from_port(self):
        while self.connected:
            print("empfangen")
            reading = self.ser.readline().decode()
            self.handle_data(reading)
        if self.connected == False:
            print "not connected - nothing to read!"
    
    
if __name__ == "__main__":
    pass
    mytest = Asctec()
    
        