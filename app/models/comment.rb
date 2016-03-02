class Comment < ActiveRecord::Base
    has_many :solutions
    belongs_to :post
    belongs_to :user
    has_many :tags

    def as_json(options = {})
        super(options.merge(include:[:user, solutions: {include: [:user_id, :username, :body] }]))
    end
end
