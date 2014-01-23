var UAV = { //AscTecModel
    LL_STATUS: //struct 
    {
        //battery voltages in mV
        battery_voltage_1: undefined, //short
        battery_voltage_2: undefined, //short
        //don’t care
        status: undefined, //short
        //Controller cycles per second (should be ˜1000)
        cpu_load: undefined, //short
        //don’t care
        compass_enabled: undefined, //char 
        chksum_error: undefined, //char 
        flying: undefined, //char 
        motors_on: undefined, //char 
        flightMode: undefined, //short
        //Time motors are turning
        up_time: undefined, //short
    },
    IMU_RAWDATA: //struct 
    {
        //pressure sensor 24-bit value, not scaled but bias free
        pressure: undefined, //int
        //16-bit gyro readings; 32768 = 2.5V
        gyro_x: undefined, //short
        gyro_y: undefined, //short
        gyro_z: undefined, //short
        //10-bit magnetic field sensor readings
        mag_x: undefined, //short
        mag_y: undefined, //short
        mag_z: undefined, //short
        //16-bit accelerometer readings
        acc_x: undefined, //short
        acc_y: undefined, //short
        acc_z: undefined, //short

        //16-bit temperature measurement using yaw-gyro internal sensor
        temp_gyro: undefined, //unsigned short 
        //16-bit temperature measurement using ADC internal sensor
        temp_ADC: undefined, //unsigned int 
    },
    IMU_CALCDATA: //struct 
    {
        //angles derived by integration of gyro_outputs, drift compensated by data fusion; -90000..+90000 pitch(nick) and roll, 0..360000 yaw; 1000 = 1 degree
        angle_nick: undefined, //int
        angle_roll: undefined, //int
        angle_yaw: undefined, //int
        //angular velocities, raw values [16 bit] but bias free
        angvel_nick: undefined, //int
        angvel_roll: undefined, //int
        angvel_yaw: undefined, //int
        //acc-sensor outputs, calibrated: -10000..+10000 = -1g..+1g
        acc_x_calib: undefined, //short
        acc_y_calib: undefined, //short
        acc_z_calib: undefined, //short
        //horizontal / vertical accelerations: -10000..+10000 = -1g..+1g
        acc_x: undefined, //short
        acc_y: undefined, //short
        acc_z: undefined, //short
        //reference angles derived by accelerations only: -90000..+90000; 1000 = 1 degree
        acc_angle_nick: undefined, //int
        acc_angle_roll: undefined, //int
        //total acceleration measured (10000 = 1g)
        acc_absolute_value: undefined, //int
        //magnetic field sensors output, offset free and scaled; units not determined, as only the direction of the field vector is taken into account
        Hx: undefined, //int
        Hy: undefined, //int
        Hz: undefined, //int
        //compass reading: angle reference for angle_yaw: 0..360000; 1000 = 1 degree
        mag_heading: undefined, //int

        //pseudo speed measurements: integrated accelerations, pulled towards zero; units unknown; used for short-term position stabilization
        speed_x: undefined, //int
        speed_y: undefined, //int
        speed_z: undefined, //int
        //height in mm (after data fusion)
        height: undefined, //int
        //diff. height in mm/s (after data fusion)
        dheight: undefined, //int
        //diff. height measured by the pressure sensor [mm/s]
        dheight_reference: undefined, //int
        //height measured by the pressure sensor [mm]
        height_reference: undefined, //int
    },
    GPS_DATA: //struct 
    {
        //latitude/longitude in deg * 10ˆ7
        latitude: undefined, //int
        longitude: undefined, //int
        //GPS height in mm
        height: undefined, //int
        //speed in x (E/W) and y(N/S) in mm/s
        speed_x: undefined, //int
        speed_y: undefined, //int
        //GPS heading in deg * 1000
        heading: undefined, //int
        //accuracy estimates in mm and mm/s
        horizontal_accuracy: undefined, //unsigned int 
        vertical_accuracy: undefined, //unsigned int 
        speed_accuracy: undefined, //unsigned int 
        //number of satellite vehicles used in NAV solution
        numSV: undefined, //unsigned int 
        // GPS status information, 0x03 = valid GPS fix
        status: undefined, //int
    },
    GPS_DATA_ADVANCED: //struct 
    {
        //latitude/longitude in deg * 10ˆ7

        latitude: undefined, //int
        longitude: undefined, //int
        //GPS height in mm
        height: undefined, //int
        //speed in x (E/W) and y(N/S) in mm/s
        speed_x: undefined, //int
        speed_y: undefined, //int
        //GPS heading in deg * 1000
        heading: undefined, //int
        //accuracy estimates in mm and mm/s
        horizontal_accuracy: undefined, //unsigned int 
        vertical_accuracy: undefined, //unsigned int 
        speed_accuracy: undefined, //unsigned int 
        //number of satellite vehicles used in NAV solution
        numSV: undefined, //unsigned int 
        //GPS status information, 0x03 = valid GPS fix
        status: undefined, //int
        //coordinates of current origin in deg * 10ˆ7
        latitude_best_estimate: undefined, //int
        longitude_best_estimate: undefined, //int
        //velocities in X (E/W) and Y (N/S) after data fusion
        speed_x_best_estimate: undefined, //int
        speed_y_best_estimate: undefined, //int
    },
    RC_DATA: //struct 
    {
        //channels as read from R/C receiver
        channels_in: undefined, //unsigned short [8]
        //channels bias free, remapped and scaled to 0..4095
        channels_out: undefined, //unsigned short [8]
        //Indicator for valid R/C receiption
        lock: undefined, //unsigned char 
    },
    CONTROLLER_OUTPUT: //struct 
    {
        //attitude controller outputs; 0..200 = -100 ..+100%
        nick: undefined, //int
        roll: undefined, //int
        yaw: undefined, //int
        //current thrust (height controller output); 0..200 = 0..100%
        thrust: undefined, //int
    }
}
