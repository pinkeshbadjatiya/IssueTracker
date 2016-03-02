class MsgsController < ApplicationController
    respond_to :html, :json

    def show
        if current_user
            d=Msg.where(:user_id => current_user.id, :seen => 0)
            i=0
            for ms in d
                ms.update_attributes(:seen => 1)
                i += 1
            end
            respond_with d.as_json
        end
    end

    def tags
        respond_with Tag.where(:comment_id => params[:id])[0]
    end

    def inserttags

    end
end
