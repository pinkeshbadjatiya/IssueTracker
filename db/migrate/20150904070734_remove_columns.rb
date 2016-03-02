class RemoveColumns < ActiveRecord::Migration
  def change
      remove_column :Solutions, :updated_at
  end
end
