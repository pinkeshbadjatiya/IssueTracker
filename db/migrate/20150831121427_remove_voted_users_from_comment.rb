class RemoveVotedUsersFromComment < ActiveRecord::Migration
  def change
    remove_reference :comments, :votedusers, index: true, foreign_key: true
  end
end
