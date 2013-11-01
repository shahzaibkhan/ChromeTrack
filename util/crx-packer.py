#-------------------------------------------------------------------------------
# Name:        Command-line CRX Packer
# Usage:       Pack Google Chrome extensions on the command line.
#
# Author:      jthuraisamy
# Created:     2013-11-01
#-------------------------------------------------------------------------------
#!/usr/bin/env python

# Import internal modules.
import struct
import subprocess
from argparse import ArgumentParser

class CRX(object):
    def __init__(self, input_dir, key_file, output_file):
        self.input_dir = input_dir
        self.key_file = key_file
        self.output_file = output_file

    def _run_process(self, cmd_line):
        return subprocess.Popen(cmd_line, stdout=subprocess.PIPE).stdout.read()

    def pack(self):
        # Zip input directory.
        pass
        # Generate public key from private key in key_file.
        pub_key = self._run_process(["openssl", "rsa", "-pubout", "-inform",
            "PEM", "-outform", "DER", "-in", self.key_file])
        # Sign zip_file with the key_file in PEM format.
        signature = self._run_process(["openssl", "sha1", "-sign",
            self.key_file, zip_file])
        # Generate header.
        magic = 'Cr24'
        version = struct.pack("<I", 2)
        pub_key_len = struct.pack("<I", len(pub_key))
        signature_len = struct.pack("<I", len(signature))
        # Write data to CRX file.
        with open(self.output_file, 'wb') as crx:
            crx.write(magic)
            crx.write(version)
            crx.write(pub_key_len)
            crx.write(signature_len)
            crx.write(pub_key)
            crx.write(signature)
            crx.write(zip_file)
