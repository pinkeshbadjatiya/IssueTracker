class AddIssecureToPost < ActiveRecord::Migration
  def change
    add_column :posts, :issecure, :boolean
  end
end
