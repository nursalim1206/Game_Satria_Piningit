/*:
* @plugindesc Skips the fight/escape menu at the start of each turn.
* @author Zevia
*
* @help This plugin will cause the party menu where you choose fight or escape
* to be skipped at the start of each turn. The Escape command will be moved
* to the end of the command menu. The Escape command can be removed altogether
* by changing the "Add Escape Command" parameter in the configuration.
*
* @param isEscapeEnabled
* @text Add Escape Command
* @type boolean
* @desc Whether the Escape command will be added to the actor's command list or not
* @default true
*
* @param shouldDisablePartyMenu
* @text Disable Party Menu
* @type boolean
* @desc Prevent the User from going back to the Fight/Escape menu by hitting the escape key.
* @default true
*/

(function(module) {
    'use strict';

    module.Zevia = module.Zevia || {};
    var SkipPartyMenu = module.Zevia.SkipPartyMenu = {};
    var ESCAPE_SYMBOL = 'escape';
    var parameters = PluginManager.parameters('SkipPartyMenu');
    var isEscapeEnabled = !!parameters.isEscapeEnabled.match(/true/i);
    var shouldDisablePartyMenu = !!parameters.shouldDisablePartyMenu.match(/true/i);

    SkipPartyMenu.shouldPreventCancelMenu = function() {
        return shouldDisablePartyMenu &&
            (
                BattleManager._actorIndex < 1 ||
                (BattleManager.isSTB && BattleManager.isSTB()) ||
                (BattleManager.isATB && BattleManager.isATB())
            );
    };

    SkipPartyMenu.startBattlerInput = BattleManager.startInput;
    BattleManager.startInput = function() {
        SkipPartyMenu.startBattlerInput.call(this);
        if (BattleManager.isSTB && BattleManager.isSTB()) { return; }

        BattleManager.selectNextCommand();
    };

    SkipPartyMenu.createActorCommandWindow = Scene_Battle.prototype.createActorCommandWindow;
    Scene_Battle.prototype.createActorCommandWindow = function() {
        SkipPartyMenu.createActorCommandWindow.call(this);
        if (!isEscapeEnabled) { return; }

        this._actorCommandWindow.setHandler(ESCAPE_SYMBOL, function() {
            BattleManager.actor()._actionState = '';
            if (!BattleManager.processEscape() && BattleManager.isATB && BattleManager.isATB()) {
                BattleManager._phase = 'atb';
                SceneManager._scene._actorCommandWindow.deactivate();
            }
        });
    };

    SkipPartyMenu.changeInputWindow = Scene_Battle.prototype.changeInputWindow;
    Scene_Battle.prototype.changeInputWindow = function() {
        if (!shouldDisablePartyMenu) {
            SkipPartyMenu.changeInputWindow.call(this);
            return;
        }

        if (BattleManager.isInputting()) {
            if (!BattleManager.actor()) {
                BattleManager._actorIndex = 0;
                BattleManager.actor().setActionState('inputting');
            }
            this.startActorCommandSelection();
        } else {
            this.endCommandSelection();
        }
    };

    SkipPartyMenu.makeCommandList = Window_ActorCommand.prototype.makeCommandList;
    Window_ActorCommand.prototype.makeCommandList = function() {
        SkipPartyMenu.makeCommandList.call(this);
        if (this._actor && isEscapeEnabled) {
            this.addCommand(TextManager.escape, ESCAPE_SYMBOL, BattleManager.canEscape());
        }
    };

    SkipPartyMenu.processCancel = Window_ActorCommand.prototype.processCancel;
    Window_ActorCommand.prototype.processCancel = function() {
        if (SkipPartyMenu.shouldPreventCancelMenu()) { return; }
        SkipPartyMenu.processCancel.call(this);
    };
})(window);