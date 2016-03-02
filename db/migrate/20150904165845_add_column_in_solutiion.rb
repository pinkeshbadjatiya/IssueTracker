class AddColumnInSolutiion < ActiveRecord::Migration
  def change
      add_column :solutions, :username, :string
  end
end
