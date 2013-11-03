var settings = {};

settings.SSL_ON           = 0;
settings.PORT             = 8080;
settings.PRIVATE_KEY_PATH = 'privateKey.pem';
settings.CERTIFICATE_PATH = 'certificate.pem';
settings.DB_PATH          = 'activity.sqlite';
settings.PAGE_CAPTURE_DIR = 'pageCaptures/';

module.exports = settings;