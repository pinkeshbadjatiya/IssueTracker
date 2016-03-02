class AddFlagToComment < ActiveRecord::Migration
  def change
    add_column :comments, :flag, :integer
  end
end
