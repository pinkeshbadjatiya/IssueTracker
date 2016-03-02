class AddColumnInMsg < ActiveRecord::Migration
  def change
      add_column :msgs, :seen, :integer
  end
end
