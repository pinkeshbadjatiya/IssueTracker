class Post < ActiveRecord::Base
    has_many :comments
    belongs_to :user

    def as_json(options = {})
        #super(options.merge(include: [:user, comments: {include: :user}]))
        super(options.merge(include: [:user, comments: {include: [:user, solutions: {only: [:username, :body]}]}]))
    end
end
