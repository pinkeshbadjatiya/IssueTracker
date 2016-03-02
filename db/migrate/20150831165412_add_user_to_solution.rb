class AddUserToSolution < ActiveRecord::Migration
  def change
    add_reference :solutions, :user, index: true, foreign_key: true
  end
end
