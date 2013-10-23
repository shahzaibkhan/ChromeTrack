// lz-string helper functions

var compressString = function (uncompressedString) {
    compressed = LZString.compress(uncompressedString);
    compressedString = LZString.compressToBase64(compressed);
    compressedB64 = Base64String.compress(compressedString);
    console.log("Compressed / Uncompressed Length:",
                compressedB64.length, "/", uncompressedString.length,
                "(" + compressedB64.length * 100 / uncompressedString.length +
                "%)");
    return compressedB64;
};