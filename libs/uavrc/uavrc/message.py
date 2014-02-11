import time
import string
import random


def create(emitter_id,body):
    return {"header":{
        "msg":{
            "id": ''.join(random.choice(string.ascii_lowercase + string.digits) for x in range(9)) ,
            "emitter":emitter_id,
            "timestamp": int(time.time())
            }
        }, "body":  body
    }