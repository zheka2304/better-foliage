
var config_leaves_variant_count = Math.max(1, Math.min(24, __config__.getInteger("leaves.variant_count") || 6));
var config_leaves_density = Math.max(1, Math.min(3, __config__.getInteger("leaves.density") || 3));
var config_leaves_rich_model = __config__.getBool("leaves.rich_model");


class LeavesModel extends VariantModelGenerator {
    constructor(texture, leavesData) {
        this.texture = texture;
        this.leavesData = leavesData;
    }

    getPartCount() {
        return config_leaves_rich_model ? 3 : 1;
    }

    getTextures(part) {
        return [
            ["better_foliage_leaves_0_" + this.texture[0], this.texture[1]],
            ["better_foliage_leaves_1_" + this.texture[0], this.texture[1]],
            // ["stone", 0],
        ];
    }

    getPartVariantCount(part, texture) {
        return 3;
    }

    buildPartVariant(model, mesh, part, texture, variant, random) {
        if (variant >= config_leaves_density) {
            return;
        }

        var s = 1 / Math.sqrt(2);
        mesh.setNormal(0, 0, 0);
        
        if (this.leavesData != undefined) {
            mesh.setFoliageTinted(this.leavesData);
        } else {
            mesh.setNoTint();
        }

        var cTop = 1;
        var cBot = .6;
        var cSide = .75;

        switch(part) {
            case 0:
                addTwoSidedPolyToMesh(mesh, [
                    [0.5 - s, 0.5 - 1, 0.5 - s, 0, 0, cBot, cBot, cBot],
                    [0.5 - s, 0.5 + 1, 0.5 - s, 0, 1, cTop, cTop, cTop],
                    [0.5 + s, 0.5 + 1, 0.5 + s, 1, 1, cTop, cTop, cTop],
                    [0.5 + s, 0.5 - 1, 0.5 + s, 1, 0, cBot, cBot, cBot],
                ])
                addTwoSidedPolyToMesh(mesh, [
                    [0.5 + s, 0.5 - 1, 0.5 - s, 0, 0, cBot, cBot, cBot],
                    [0.5 + s, 0.5 + 1, 0.5 - s, 0, 1, cTop, cTop, cTop],
                    [0.5 - s, 0.5 + 1, 0.5 + s, 1, 1, cTop, cTop, cTop],
                    [0.5 - s, 0.5 - 1, 0.5 + s, 1, 0, cBot, cBot, cBot],
                ])
                mesh.rotate(0.5, 0.5, 0.5, 0, 0.05, 0);
            break;
            case 1:
                addTwoSidedPolyToMesh(mesh, [
                    [0.5 - s, 0.5 - s, 0.5 - 1, 0, 0, cSide, cSide, cSide],
                    [0.5 - s, 0.5 - s, 0.5 + 1, 0, 1, cSide, cSide, cSide],
                    [0.5 + s, 0.5 + s, 0.5 + 1, 1, 1, cSide, cSide, cSide],
                    [0.5 + s, 0.5 + s, 0.5 - 1, 1, 0, cSide, cSide, cSide],
                ])
                addTwoSidedPolyToMesh(mesh, [
                    [0.5 + s, 0.5 - s, 0.5 - 1, 0, 0, cSide, cSide, cSide],
                    [0.5 + s, 0.5 - s, 0.5 + 1, 0, 1, cSide, cSide, cSide],
                    [0.5 - s, 0.5 + s, 0.5 + 1, 1, 1, cSide, cSide, cSide],
                    [0.5 - s, 0.5 + s, 0.5 - 1, 1, 0, cSide, cSide, cSide],
                ])
                mesh.rotate(0.5, 0.5, 0.5, 0, 0, 0.05);
            break;
            case 2:
                addTwoSidedPolyToMesh(mesh, [
                    [0.5 - 1, 0.5 - s, 0.5 - s, 0, 0, cSide, cSide, cSide],
                    [0.5 + 1, 0.5 - s, 0.5 - s, 0, 1, cSide, cSide, cSide],
                    [0.5 + 1, 0.5 + s, 0.5 + s, 1, 1, cSide, cSide, cSide],
                    [0.5 - 1, 0.5 + s, 0.5 + s, 1, 0, cSide, cSide, cSide],
                ])
                addTwoSidedPolyToMesh(mesh, [
                    [0.5 - 1, 0.5 + s, 0.5 - s, 0, 0, cSide, cSide, cSide],
                    [0.5 + 1, 0.5 + s, 0.5 - s, 0, 1, cSide, cSide, cSide],
                    [0.5 + 1, 0.5 - s, 0.5 + s, 1, 1, cSide, cSide, cSide],
                    [0.5 - 1, 0.5 - s, 0.5 + s, 1, 0, cSide, cSide, cSide],
                ])
                mesh.rotate(0.5, 0.5, 0.5, 0.05, 0, 0);
            break;
        }
    }

    mapLeavesModel(id, data, variantCount, oldModel) {
        if (!__config__.getBool("leaves.enabled")) {
            return;
        }

        var icRender;
        var leavesGroup = ICRender.getUnnamedGroup();
        if (oldModel) {
            icRender = oldModel;
        } else {
            icRender = new ICRender.Model();
            var baseModel = new BlockRenderer.Model();
            baseModel.addBlock(id, data != -1 ? data : 0);
            var entry = icRender.addEntry(baseModel);
            leavesGroup.add(id, data)
            entry.setCondition(this.fullyClosedCondition(leavesGroup, true))
        }

        ItemModel.getFor(id, data != -1 ? data : 0).occupy();
        BlockRenderer.setStaticICRender(id, data, icRender);

        this.buildAllParts(icRender, this.fullyClosedCondition(leavesGroup, true), variantCount);
    }
}


(function() {
    var variantCount = config_leaves_variant_count;
    var oakModel = new LeavesModel(["leaves_oak", 0], 0);
    var spruceModel = new LeavesModel(["leaves_spruce", 0], 1);
    var birchModel = new LeavesModel(["leaves_birch", 0], 2);
    var jungleModel = new LeavesModel(["leaves_jungle", 0], 3);
    oakModel.mapLeavesModel(18, 0, variantCount);
    spruceModel.mapLeavesModel(18, 1, variantCount);
    birchModel.mapLeavesModel(18, 2, variantCount);
    jungleModel.mapLeavesModel(18, 3, variantCount);
    oakModel.mapLeavesModel(161, 0, variantCount);
    oakModel.mapLeavesModel(161, 1, variantCount); 
}) ();


ModAPI.registerAPI("BetterFoliageLeaves", {
    setupLeavesModel: function(id, data, texture, leavesData, variantCount) {
        var oakModel = new LeavesModel(texture, leavesData);
        oakModel.mapLeavesModel(id, data, variantCount || config_leaves_variant_count);
    }
});