class AddUpvotesUsernameToComment < ActiveRecord::Migration
  def change
    add_reference :comments, :votedusers, references: :user
  end
end
