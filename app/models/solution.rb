class Solution < ActiveRecord::Base
    belongs_to :comments
    belongs_to :user

    def as_json(options = {})
        super(options.merge(only:[:username, :body]))
    end

end
