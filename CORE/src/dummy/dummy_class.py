from socketIO_client import SocketIO
import simplejson as json


id = "ASCTEC"
slots = ["CAMERA_PITCH_ANGLE_SET","CAMERA_PITCH_ANGLE_GET","GPS_DATA"]
signals = ["CAMERA_PITCH_ANGLE"]
host = 'localhost'
port = 8081
        
class Asctec(object): 

    def __init__(self):
        self.pitch_angle = 90
        self.socketIO = SocketIO(host, port)
        self.socketIO.on('connect', self.on_connect)
        [self.socketIO.on(i,getattr(self, "on_"+i)) for i in slots] 
        self.socketIO.wait()

    def on_connect(self,*args):
        print 'connect'
        moduleDesc = {'id':id,'slots':slots,'signals':signals}
        self.socketIO.emit('link', moduleDesc)

    def on_CAMERA_PITCH_ANGLE_SET(self,args):
        self.pitch_angle = args['pitchangle']
        self.on_CAMERA_PITCH_ANGLE_GET()

    def on_CAMERA_PITCH_ANGLE_GET(self,args=None):
        self.socketIO.emit('CAMERA_PITCH_ANGLE', {"pitchangle":self.pitch_angle})

    def on_GPS_DATA(self,args):
        print 'got GPS_DATA'
    
if __name__ == "__main__":
    Asctec()

        