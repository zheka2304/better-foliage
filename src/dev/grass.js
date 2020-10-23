var config_grass_variant_count = Math.max(1, Math.min(24, __config__.getInteger("reed.variant_count") || 12));
var config_grass_density = Math.max(1, Math.min(3, __config__.getInteger("grass.density") || 2));


class GrassModel extends VariantModelGenerator {
    getPartCount() {
        return 1;
    }

    getTextures(part) {
        return [
            ["better_grass_short", 0],
            ["better_grass_short", 1],
            ["better_grass_short", 2],
            ["better_grass_long", 0],
            ["better_grass_long", 1],
            ["better_grass_long", 2],
            ["better_grass_long", 3],
            ["better_grass_long", 4],
            // ["stone", 0],
        ];
    }

    getPartVariantCount(part, texture) {
        return 6;
    }

    buildPartVariant(model, mesh, part, texture, variant, random) {
        mesh.setNormal(0, -1, 0);
        mesh.setLightPos(0, 1, 0);
        mesh.setGrassTinted();

        var s = Math.sqrt(2) / ((variant % 2) * 0.5 + 3);
        var h = 0.5;
        switch(part) {
            case 0:
            addTwoSidedPolyToMesh(mesh, [
                [0.5 - s, 1, 0.5 - s, 0, 1],
                [0.5 - s, 1 + h * 2 * s, 0.5 - s, 0, 1 - h],
                [0.5 + s, 1 + h * 2 * s, 0.5 + s, 1, 1 - h],
                [0.5 + s, 1, 0.5 + s, 1, 1]
            ]);
            addTwoSidedPolyToMesh(mesh, [
                [0.5 - s, 1, 0.5 + s, 0, 1],
                [0.5 - s, 1 + h * 2 * s, 0.5 + s, 0, 1 - h],
                [0.5 + s, 1 + h * 2 * s, 0.5 - s, 1, 1 - h],
                [0.5 + s, 1, 0.5 - s, 1, 1]
            ]);
            break;
        }

        mesh.rotate(0.5, 0.5, 0.5, 0, variant * 0.2 + 0.1, 0)
    }

    mapGrassModel(id, data, variantCount, oldModel) {
        if (!__config__.getBool("grass.enabled")) {
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

        var condition = new ICRender.NOT(new ICRender.RANDOM(1, 2 + config_grass_density));
        if (!__config__.getBool("grass.ignore_top_block")) {
            var airGroup = ICRender.getUnnamedGroup();
            // allow alot of blocks, that go well with grass
            airGroup.add(0, 0);
            airGroup.add(6, -1);
            airGroup.add(31, -1);
            airGroup.add(32, -1);
            airGroup.add(37, -1);
            airGroup.add(38, -1);
            airGroup.add(39, -1);
            airGroup.add(40, -1);
            airGroup.add(50, -1);
            airGroup.add(63, -1);
            airGroup.add(68, -1);
            airGroup.add(75, -1);
            airGroup.add(76, -1);
            airGroup.add(83, -1);
            airGroup.add(85, -1);
            airGroup.add(106, -1);
            airGroup.add(107, -1);
            airGroup.add(175, -1);
            airGroup.add(183, -1);
            airGroup.add(184, -1);
            airGroup.add(185, -1);
            airGroup.add(186, -1);
            airGroup.add(187, -1);
            condition = new ICRender.AND(new ICRender.BLOCK(0, 1, 0, airGroup, false), condition);
        } else {
            var airGroup = ICRender.getUnnamedGroup();
            airGroup.add(78, -1); // just ignore snow
            condition = new ICRender.AND(new ICRender.BLOCK(0, 1, 0, airGroup, true), condition);
        }
        this.buildAllParts(icRender, condition, variantCount);
    }
}


(function() {
    var grassModel = new GrassModel();
    grassModel.mapGrassModel(2, 0, config_grass_variant_count);
}) ();