#include <hook.h>
#include <mod.h>
#include <logger.h>
#include <symbol.h>
#include <nativejs.h>



// modules are main structural units of native libraries, all initialization must happen inside of them
class MainModule : public Module {
public:
	MainModule(const char* id): Module(id) {};

	virtual void initialize() {	
        // avoid problem with library loading order on older horizon versions
        DLHandleManager::initializeHandle("libminecraftpe.so", "mcpe");

        // any HookManager::addCallback calls must be in initialize method of a module
        // any other initialization also highly recommended to happen here
        
        // hook leaves renderlayer
        HookManager::addCallback(SYMBOL("mcpe", "_ZNK9LeafBlock14getRenderLayerERK5BlockR11BlockSourceRK8BlockPos"), LAMBDA((HookManager::CallbackController* controller), {
            controller->replace(); // call this to override renderlayer, otherwise original method is called and result 1 is ignored
            return 3;
        }, ), HookManager::CALL | HookManager::LISTENER | HookManager::CONTROLLER | HookManager::RESULT); 

        // hook leaves renderlayer
        HookManager::addCallback(SYMBOL("mcpe", "_ZNK12OldLeafBlock14getRenderLayerERK5BlockR11BlockSourceRK8BlockPos"), LAMBDA((HookManager::CallbackController* controller), {
            controller->replace(); // call this to override renderlayer, otherwise original method is called and result 1 is ignored
            return 3;
        }, ), HookManager::CALL | HookManager::LISTENER | HookManager::CONTROLLER | HookManager::RESULT); 
        
    }
};

// entry point for a native library
// only one MAIN {} allowed per library
MAIN {
	// create all modules
	Module* main_module = new MainModule("betterfoliage");
}

// module version defines version of next functions, that belong to this module
// if several modules with one name is loaded and several same functions registered, only function with highest version is registered
// this is required in case of libraries 
JS_MODULE_VERSION(BetterFoliageConfig, 1)

// exports module and function to javascript, now you can call WRAP_NATIVE("SampleNativeModule") and a module with single function "hello", receiving two numbers, will be returned
// signature I(LL) defines a method, receiving two ints, and returning long
JS_EXPORT(BetterFoliageConfig, setLeavesEnabled, "I(I)", (JNIEnv* env, int value) {
	return 0;
});
