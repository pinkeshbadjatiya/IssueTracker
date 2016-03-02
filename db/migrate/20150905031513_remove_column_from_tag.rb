class RemoveColumnFromTag < ActiveRecord::Migration
  def change
      remove_column :tags, :created_at
      remove_column :tags, :updated_at
  end
end
