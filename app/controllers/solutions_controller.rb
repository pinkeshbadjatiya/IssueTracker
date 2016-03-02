class SolutionsController < ApplicationController

    respond_to :html, :json
    def create
        respond_with Solution.create(post_params.merge(user_id: current_user.id))
    end

    def show
        respond_with Solution.find(params[:id])
    end
end
