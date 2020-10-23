var config_reed_variant_count = Math.max(1, Math.min(48, __config__.getInteger("reed.variant_count") || 12));
var config_reed_density = Math.max(1, Math.min(3, __config__.getInteger("reed.density") || 2));


class ReedModel extends VariantModelGenerator {
    getPartCount() {
        return 4;
    }

    getTextures(part) {
        return [
            ["better_reed", 0],
            ["better_reed", 1],
            // ["stone", 0],
        ];
    }

    getPartVariantCount(part, texture) {
        return 2;
    }

    buildPartVariant(model, mesh, part, texture, variant, random) {
        mesh.setNormal(0, 0, 0);
        mesh.setLightPos(0, 2, 0);
        var move = 0.25;
        var width = 0.75;
        var height = 3;
        var u = variant == 0 ? 0 : 0.5;
        switch(part) {
            case 0:
            addTwoSidedPolyToMesh(mesh, [
                [move, 1, 0.5 - width, u, 1],
                [move, 1 + height, 0.5 - width, u, 0],
                [move, 1 + height, 0.5 + width, 0.5 + u, 0],
                [move, 1, 0.5 + width, 0.5 + u, 1],
            ]);
            break;
            case 1:
            addTwoSidedPolyToMesh(mesh, [
                [1 - move, 1, 0.5 - width, u, 1],
                [1 - move, 1 + height, 0.5 - width, u, 0],
                [1 - move, 1 + height, 0.5 + width, 0.5 + u, 0],
                [1 - move, 1, 0.5 + width, 0.5 + u, 1],
            ]);
            break;
            case 2:
            addTwoSidedPolyToMesh(mesh, [
                [0.5 - width, 1, move, u, 1],
                [0.5 - width, 1 + height, move, u, 0],
                [0.5 + width, 1 + height, move, 0.5 + u, 0],
                [0.5 + width, 1, move, 0.5 + u, 1],
            ]);
            break;
            case 3:
            addTwoSidedPolyToMesh(mesh, [
                [0.5 - width, 1, 1 - move, u, 1],
                [0.5 - width, 1 + height, 1 - move, u, 0],
                [0.5 + width, 1 + height, 1 - move, 0.5 + u, 0],
                [0.5 + width, 1, 1 - move, 0.5 + u, 1],
            ]);
            break;
        }
    }

    mapReedModel(id, data, variantCount, oldModel) {
        if (!__config__.getBool("reed.enabled")) {
            return;
        }

        var icRender;
        if (oldModel) {
            icRender = oldModel;
        } else {
            icRender = new ICRender.Model();
            var baseModel = new BlockRenderer.Model();
            baseModel.addBlock(id, data != -1 ? data : 0);
            icRender.addEntry(baseModel);
        }

        ItemModel.getFor(id, data != -1 ? data : 0).occupy();
        BlockRenderer.setStaticICRender(id, data, icRender, 1273);

        var airGroup = ICRender.getUnnamedGroup();
        airGroup.add(0, 0);
        var waterGroup = ICRender.getUnnamedGroup();
        waterGroup.add(8, -1);
        waterGroup.add(9, -1);
        this.buildAllParts(icRender, new ICRender.AND(
            new ICRender.RANDOM(0, 5 - config_reed_density),
            new ICRender.BLOCK(0, 2, 0, airGroup, false), 
            new ICRender.BLOCK(0, 1, 0, waterGroup, false)
        ), variantCount);
    }
}


(function() {
    var reedModel = new ReedModel();
    reedModel.mapReedModel(3, 0, config_reed_variant_count);
}) ();