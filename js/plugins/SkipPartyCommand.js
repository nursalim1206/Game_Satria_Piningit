class Scene_Battle < Scene_Base
  alias :party_skip_start_party_command_selection :start_party_command_selection
  def start_party_command_selection
    party_skip_start_party_command_selection
    @party_command_window.deactivate
     if BattleManager.input_start
       command_fight
     else
       turn_start
    end
  end
end
module BattleManager
   
#--------------------------------------------------------------------------  
# * To Previous Command Input  
#--------------------------------------------------------------------------  
def self.prior_command
    last_actor_index = @actor_index
    retries = $game_party.max_battle_members
    begin
      if !actor || !actor.prior_command
        @actor_index -= 1
        @actor_index = 0  if @actor_index < 0
      end
      retries -= 1
      if retries == 0
        @actor_index = last_actor_index
        break
      end
    end until actor.inputable?
    return true
   end
  end