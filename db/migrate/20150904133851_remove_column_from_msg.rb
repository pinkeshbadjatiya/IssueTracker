class RemoveColumnFromMsg < ActiveRecord::Migration
  def change
      remove_column :Msgs, :updated_at
      remove_column :Msgs, :created_at
  end
end
