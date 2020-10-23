var FileHelper = {
    asFile: function(pathOrFile) {
        if (typeof(pathOrFile) == "string") {
            return new java.io.File(pathOrFile);
        }
        return pathOrFile;
    },
    
    getResourceDirectory: function() {
        return new java.io.File(__dir__, "resources/res").getAbsolutePath();
    },

    allocatePath: function(directory, name) {
        var resourceDir = this.getResourceDirectory();
        var dir = new java.io.File(resourceDir, directory);
        dir.mkdirs();
        return new java.io.File(dir, name).getAbsolutePath();
    },
    
    readText: function(file) {
        file = this.asFile(file);
        var str = new java.lang.StringBuilder();
        var reader = java.io.BufferedReader(new java.io.FileReader(file));
        var line = null;
        while (line = reader.readLine()) {
            str.append(line).append("\n");
        }
        return str.toString();
    },

    writeText: function (file, text, add) {
        file = this.asFile(file);
        var writer = new java.io.PrintWriter(new java.io.BufferedWriter(new java.io.FileWriter(file, add || false)));
        writer.write(text);
        writer.close();
    },

    readJson: function(file) {
        var text = this.readText(file);
        return JSON.parse(text);
    },

    writeJson: function(file, obj) {
        obj = obj || {};
        var textFile = JSON.stringify(obj, null, beautify ? "\t" : null);
        this.writeText(file, textFile);
    },
    
    readBitmap: function (file) {
        file = this.asFile(file);
        var options = new android.graphics.BitmapFactory.Options();
        options.inScaled = false;
        try {
            var bmp = android.graphics.BitmapFactory.decodeFile(file, options);
            return bmp;
        }
        catch (e) {
            print(e);
            return null;
        }
    },

    writeBitmap: function (file, bitmap) {
        file = this.asFile(file);
        var output = new java.io.FileOutputStream(file);
        bitmap.compress(android.graphics.Bitmap.CompressFormat.PNG, 100, output);
        output.close();
    }, 
};

var allConfigFiles = Resources.getAllMatchingResources(".*\\.rescfg");
for (var i in allConfigFiles) {
    var configFile = allConfigFiles[i];
    // try {
        processResourceConfig(FileHelper.readJson(configFile));
    // } catch(e) {
    //     print("failed to process resource config: " + configFile + " " + e);
    // }
}



function processResourceConfig(_config) {
    var config = _config["better-foliage"];
    if (config) {
        if (config.leaves) {
            for (var i in config.leaves) {
                generateLeavesTextures(config.leaves[i]);
            }
        }
    }
}



function generateLeavesTextures(config) {
    var maskNames = ["better-foliage/leaves_mask_default.png", "better-foliage/leaves_mask_jumbled.png", "better-foliage/leaves_mask_fine.png"];
    for (var i in maskNames) {
        var texturePath = FileHelper.asFile(Resources.getResourcePath(config.texture));
        var maskPath = Resources.getResourcePath(maskNames[i]);
        if (texturePath && maskPath) {
            try {
                var texture = FileHelper.readBitmap(texturePath);
                var mask = FileHelper.readBitmap(maskPath);
                if (texture && mask) {
                    var w = texture.getWidth();
                    var h = texture.getHeight();
                    var result = android.graphics.Bitmap.createBitmap(w * 2, h * 2, android.graphics.Bitmap.Config.ARGB_8888);
                    var canvas = new android.graphics.Canvas(result);
                    var scaledMask = android.graphics.Bitmap.createScaledBitmap(mask, w * 2, h * 2, false);
                    canvas.drawColor(0);
                    canvas.drawBitmap(scaledMask, 0, 0, null);
                    
                    var maskedPaint = new android.graphics.Paint();
                    maskedPaint.setXfermode(new android.graphics.PorterDuffXfermode(android.graphics.PorterDuff.Mode.SRC_IN));
                    canvas.drawBitmap(texture, 0, 0, maskedPaint);
                    canvas.drawBitmap(texture, w, 0, maskedPaint);
                    canvas.drawBitmap(texture, 0, h, maskedPaint);
                    canvas.drawBitmap(texture, w, h, maskedPaint);
                    FileHelper.writeBitmap(FileHelper.allocatePath("terrain-atlas", "better_foliage_leaves_" + i + "_" + texturePath.getName()), result);
                }
            } catch(e) {
                print(e);
            }
        }
    }
}