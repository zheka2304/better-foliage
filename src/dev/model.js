class VariantModelGenerator {
    constructor() {
        
    }

    getPartCount() {
        return 1;
    }

    getTextures(part) {
        return [["stone", 0]];
    }

    getPartCondition(part) {
        return null;
    }

    getPartVariantCount(part, texture) {
        return 1;
    }

    applyTexture(mesh, texture) {
        mesh.setBlockTexture(texture[0], texture[1]);
    }

    buildPartVariant(model, mesh, part, texture, variant, random) {
        // implement this
    }

    isMultiPartMeshAllowed() {
        return true;
    }

    makePartCondition(part, variant) {
        return null;
    }


    getAllPartVariants() {
        var allPartVariants = {};
        var partCount = this.getPartCount();
        for (var part = 0; part < partCount; part++) {
            allPartVariants[part] = [];
            var textures = this.getTextures(part);
            for (var i in textures) {
                var texture = textures[i];
                var variantCount = this.getPartVariantCount(part, texture);
                for (var variant = 0; variant < variantCount; variant++) {
                    allPartVariants[part].push([texture, variant]);
                }
            }   
        }
        return allPartVariants;
    }

    fullyClosedCondition(group, invert) {
        let top = new ICRender.BLOCK(0, 1, 0, group, false);
        let bottom = new ICRender.BLOCK(0, -1, 0, group, false);
        let right = new ICRender.BLOCK(1, 0, 0, group, false);
        let left = new ICRender.BLOCK(-1, 0, 0, group, false);
        let back = new ICRender.BLOCK(0, 0, 1, group, false);
        let front = new ICRender.BLOCK(0, 0, -1, group, false);
        let fullCondition = new ICRender.AND(top, left, bottom, right, front, back);
        return invert ? new ICRender.NOT(fullCondition) : fullCondition;
    }

    buildAllParts(model, condition, totalModelVariants, seed) {
        var allPartVariants = this.getAllPartVariants();
        var maxTotalVariants = 1;
        for (var part in allPartVariants) {
            maxTotalVariants *= allPartVariants[part].length;
        }

        if (totalModelVariants > maxTotalVariants) {
            totalModelVariants = maxTotalVariants;
        }
        if (!seed) {
            seed = 1234;
        }
        
        // create random and shuffle variants
        var random = new java.util.Random(seed);

        // shuffle each part variants
        for (var n in allPartVariants) {
            var variants = allPartVariants[n];
            for (var i = 0; i < variants.length; i++) {
                var j = random.nextInt(variants.length);
                if (j != i) {
                    var tmp = variants[i];
                    variants[i] = variants[j];
                    variants[j] = tmp;
                }
            }
        }

        var variantsSeed = random.nextInt();
        // build model
        for (var i = 0; i < totalModelVariants; i++) {
            // build condition
            var currentCondition;
            if (i == 0 && totalModelVariants == 1) {
                currentCondition = condition;
            } else {
                currentCondition = new ICRender.RANDOM(i, totalModelVariants, variantsSeed);
                if (condition) {
                    currentCondition = new ICRender.AND(currentCondition, condition);
                }
            }

            // build variant set by i
            var variantSet = {};
            var m = 1;
            for (var _part in allPartVariants) {
                var part = parseInt(_part);
                var variants = allPartVariants[_part];
                if (variants.length == 0) {
                    continue;
                }
                variantSet[part] = variants[parseInt(i / m) % variants.length];
                m *= variants.length;
            }

            // group by textures and build
            while (Object.keys(variantSet).length > 0) {
                // find parts with same texture
                var parts = [];
                var texture = null;
                for (var _part in variantSet) {
                    var part = parseInt(_part);
                    var variant = variantSet[_part];
                    if (texture == null || texture == variant[0]) {
                        texture = variant[0];
                        delete variantSet[part];
                        parts.push([part, variant[0], variant[1]]);
                        if (!this.isMultiPartMeshAllowed()) {
                            break;
                        }
                    }
                }
                if (parts.length == 0) {
                    break;
                }

                // create mesh and build
                var mesh = new RenderMesh();
                this.applyTexture(mesh, texture);
                for (var j in parts) {
                    var part = parts[j];
                    this.buildPartVariant(model, mesh, part[0], part[1], part[2], random);
                }

                // build condition if required
                var curCondition = currentCondition;
                if (!this.isMultiPartMeshAllowed()) {
                    var partCondition = this.makePartCondition(parts[0][0], parts[0][2]);
                    if (partCondition) {
                        if (curCondition) {
                            curCondition = new ICRender.AND(curCondition, partCondition);
                        } else {
                            curCondition = partCondition;
                        }
                    }
                }
                // add to mesh
                var entry = model.addEntry(mesh);
                if (curCondition) {
                    entry.setCondition(curCondition);
                }
            }
        }
    }
}


// helper methods
function addPolyToMesh(mesh, vertices) {
    if (vertices.length < 3) {
        return;
    }
    function addVertex(v) {
        if (v.length > 5) {
            if (v.length > 8) { // alpha
                mesh.setColor(v[5], v[6], v[7], v[8]);
            } else { // no alpha
                mesh.setColor(v[5], v[6], v[7], 1);
            }
        }
        let someRandom = Math.random() / 10;
        mesh.addVertex(v[0] + someRandom, v[1], v[2] + someRandom, v[3], v[4]);
    }

    var v0 = vertices[0];
    for (var i = 1; i < vertices.length - 1; i++) {
        var v1 = vertices[i];
        var v2 = vertices[i + 1];
        addVertex(v0);
        addVertex(v1);
        addVertex(v2);
    }
}

function addTwoSidedPolyToMesh(mesh, vertices) {
    addPolyToMesh(mesh, vertices);
    addPolyToMesh(mesh, vertices.reverse());
}
