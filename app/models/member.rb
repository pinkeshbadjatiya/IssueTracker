class Member < ActiveRecord::Base
    belongs_to :user
    has_many :user

    belongs_to :post

    def as_json(options = {})
        super(options.merge(include: :comments))
    end
end
