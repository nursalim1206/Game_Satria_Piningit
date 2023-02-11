class Scene_Battle < Scene_Base
  alias :party_window_skip_battle_start :battle_start
  def battle_start
    party_window_skip_battle_start
    @party_command_window.deactivate
    if BattleManager.input_start
      command_fight
    else
      turn_start
    end
  end
end