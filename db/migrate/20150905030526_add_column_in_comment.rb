class AddColumnInComment < ActiveRecord::Migration
  def change
      add_reference :comments, :tags, index: true, foreign_key: true
  end
end
